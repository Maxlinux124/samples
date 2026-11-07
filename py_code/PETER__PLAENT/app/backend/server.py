#!/usr/bin/env python3
"""Peter Planet's local HTTP backend and static file server."""

import copy
import http.server
import json
import logging
import os
import re
import threading
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

STATIC_DIR = Path(__file__).parent.parent / "frontend"
PORT = 8000
HOST = "127.0.0.1"
OLLAMA_URL = os.environ.get("PETER_OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("PETER_OLLAMA_MODEL", "qwen2.5:0.5b")
OLLAMA_TIMEOUT = 90
OLLAMA_STATUS_TIMEOUT = 1
MAX_HISTORY_MESSAGES = 12
MAX_MESSAGE_CHARS = 4000
MAX_MEMORY_CHARS = 500
MAX_REQUEST_BYTES = 64 * 1024
MAX_FILE_ACTION_REQUEST_BYTES = 1024
SUPPORTED_DOCUMENT_EXTENSIONS = {
    ".csv",
    ".docx",
    ".jpeg",
    ".jpg",
    ".md",
    ".pdf",
    ".png",
    ".pptx",
    ".rtf",
    ".txt",
    ".xlsx",
}
PROFILE_PATH = Path(__file__).with_name("peter_profile.json")
PROFILE_LOCK = threading.Lock()
DOCUMENT_PICKER_LOCK = threading.Lock()

DEFAULT_PROFILE: dict[str, Any] = {
    "assistant_name": "Peter",
    "creator_name": "Sagar",
    "project_name": "Peter Planet",
    "purpose": "a friendly, local-first assistant for multilingual text and voice conversations",
    "personality": (
        "Warm, natural, supportive, and conversational, like a familiar good friend, "
        "without pretending to be human or a romantic partner."
    ),
    "languages": ["Hindi", "Urdu", "Hinglish", "Roman Urdu", "English"],
    "reply_rules": [
        "Reply in the user's language and writing style, including Roman Urdu when appropriate.",
        "Include the user's configured name exactly once in every reply.",
        "Never echo the user's question as the answer.",
        "Respond kindly when the user shares a problem or low mood.",
    ],
    "boundaries": (
        "Do not claim to control the computer, access private files, or use integrations "
        "unless Peter Planet explicitly provides them."
    ),
}


class MessageTooLongError(ValueError):
    """Raised when a chat message exceeds the configured character limit."""


class DocumentActionError(RuntimeError):
    """Raised when a selected local document cannot safely be opened."""


def get_allowed_document_roots() -> tuple[Path, ...]:
    """Return the user's standard document folders, including OneDrive variants."""
    home = Path.home()
    candidates = [
        home / "Documents",
        home / "Downloads",
        home / "Desktop",
        home / "OneDrive" / "Documents",
        home / "OneDrive" / "Downloads",
        home / "OneDrive" / "Desktop",
    ]
    return tuple(path for path in candidates if path.is_dir())


def validate_document_path(file_path: str) -> Path:
    """Resolve and allow only existing, supported documents in approved folders."""
    try:
        selected_path = Path(file_path).resolve(strict=True)
    except (OSError, RuntimeError, ValueError) as error:
        raise ValueError("The selected file could not be found.") from error

    if not selected_path.is_file():
        raise ValueError("Please select a document file.")
    if selected_path.suffix.casefold() not in SUPPORTED_DOCUMENT_EXTENSIONS:
        raise ValueError("That file type is not supported.")

    for root in get_allowed_document_roots():
        try:
            selected_path.relative_to(root.resolve(strict=True))
            return selected_path
        except (OSError, RuntimeError, ValueError):
            continue
    raise ValueError("Choose a document from Documents, Downloads, or Desktop.")


def select_document_file() -> str | None:
    """Show a native file picker limited to supported document types."""
    if not DOCUMENT_PICKER_LOCK.acquire(blocking=False):
        raise DocumentActionError("A document picker is already open.")

    try:
        import tkinter as tk
        from tkinter import filedialog
    except ImportError as error:
        DOCUMENT_PICKER_LOCK.release()
        raise DocumentActionError("The document picker is unavailable.") from error

    root = None
    try:
        root = tk.Tk()
        root.withdraw()
        roots = get_allowed_document_roots()
        selected = filedialog.askopenfilename(
            parent=root,
            title="Choose a document to open",
            initialdir=str(roots[0]) if roots else str(Path.home()),
            filetypes=[
                ("Documents", " ".join(
                    f"*{extension}" for extension in sorted(SUPPORTED_DOCUMENT_EXTENSIONS)
                )),
                ("All files", "*.*"),
            ],
        )
        return selected or None
    except (OSError, RuntimeError, tk.TclError) as error:
        raise DocumentActionError("The document picker could not be opened.") from error
    finally:
        if root is not None:
            try:
                root.destroy()
            except tk.TclError:
                logging.warning("Could not close the document picker window.")
        DOCUMENT_PICKER_LOCK.release()


def open_document(file_path: str) -> Path:
    """Open one validated document using its Windows-associated application."""
    selected_path = validate_document_path(file_path)
    startfile = getattr(os, "startfile", None)
    if startfile is None:
        raise DocumentActionError("Opening local files is supported on Windows only.")
    try:
        startfile(str(selected_path))
    except OSError as error:
        raise DocumentActionError("Windows could not open the selected document.") from error
    return selected_path


def select_and_open_document() -> Path | None:
    """Open the native picker and launch only the document selected by the user."""
    selected_path = select_document_file()
    return open_document(selected_path) if selected_path else None


def load_peter_profile() -> dict[str, Any]:
    """Load Peter's editable persona profile, falling back safely if invalid."""
    try:
        profile = json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
        if not isinstance(profile, dict):
            raise ValueError("Profile root must be a JSON object")
        merged = {**DEFAULT_PROFILE, **profile}
        for key in ("languages", "reply_rules"):
            if not isinstance(merged[key], list) or not all(
                isinstance(item, str) for item in merged[key]
            ):
                raise ValueError(f"Profile field '{key}' must be a list of strings")
        for key in (
            "assistant_name",
            "creator_name",
            "project_name",
            "purpose",
            "personality",
            "boundaries",
        ):
            if not isinstance(merged[key], str) or not merged[key].strip():
                raise ValueError(f"Profile field '{key}' must be a non-empty string")
        return merged
    except (OSError, json.JSONDecodeError, ValueError) as error:
        logging.warning(
            "Peter profile could not be loaded (%s); using built-in defaults.", error
        )
        return copy.deepcopy(DEFAULT_PROFILE)


def build_system_prompt(profile: dict[str, Any], user_name: str) -> str:
    """Create the local model's persona and safety instructions."""
    return " ".join(
        (
            f"You are {profile['assistant_name']}, created by {user_name} for "
            f"{profile['project_name']}.",
            f"Your purpose is {profile['purpose']}.",
            f"Your personality is: {profile['personality']}",
            f"Languages: {', '.join(profile['languages'])}.",
            "Reply in the same language and writing style the user used.",
            "If Hindi or Urdu is typed in Latin letters, reply in Latin letters too.",
            "Include the user's configured name exactly once in every reply.",
            "Never echo or quote the user's request as the answer; provide a useful, direct response.",
            "When the user shares a problem or low mood, acknowledge it kindly and ask one gentle follow-up.",
            f"Profile rules: {' '.join(profile['reply_rules'])}",
            profile["boundaries"],
        )
    )


def refresh_peter_profile() -> None:
    """Reload the editable profile so changes apply to the next chat request."""
    global PETER_PROFILE, PETER_USER_NAME, SYSTEM_PROMPT
    PETER_PROFILE = load_peter_profile()
    PETER_USER_NAME = (
        os.environ.get("PETER_USER_NAME", PETER_PROFILE["creator_name"]).strip()
        or PETER_PROFILE["creator_name"]
    )
    SYSTEM_PROMPT = build_system_prompt(PETER_PROFILE, PETER_USER_NAME)


refresh_peter_profile()


def build_ollama_messages(message: str, history: Any) -> list[dict[str, str]]:
    """Return a bounded, validated conversation for the local model."""
    conversation: list[dict[str, str]] = []
    if isinstance(history, list):
        for item in history[-MAX_HISTORY_MESSAGES:]:
            if not isinstance(item, dict):
                continue
            role = item.get("role")
            content = item.get("content")
            if role not in {"user", "assistant"} or not isinstance(content, str):
                continue
            content = content.strip()[:MAX_MESSAGE_CHARS]
            if content:
                conversation.append({"role": role, "content": content})

    user_message = message.strip()[:MAX_MESSAGE_CHARS]
    if not conversation or conversation[-1] != {"role": "user", "content": user_message}:
        conversation.append({"role": "user", "content": user_message})

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        *conversation[-MAX_HISTORY_MESSAGES:],
    ]


def generate_ollama_reply(messages: list[dict[str, str]]) -> str | None:
    """Ask the configured local Ollama model; return None if it is unavailable."""
    try:
        request = urllib.request.Request(
            f"{OLLAMA_URL}/api/chat",
            data=json.dumps(
                {"model": OLLAMA_MODEL, "messages": messages, "stream": False}
            ).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=OLLAMA_TIMEOUT) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (
        urllib.error.URLError,
        TimeoutError,
        OSError,
        ValueError,
        UnicodeDecodeError,
        json.JSONDecodeError,
    ):
        return None

    if not isinstance(result, dict):
        return None
    model_message = result.get("message")
    if not isinstance(model_message, dict):
        return None
    reply = model_message.get("content")
    return reply.strip()[:MAX_MESSAGE_CHARS] if isinstance(reply, str) and reply.strip() else None


def ollama_model_available() -> bool:
    """Check whether the configured model is installed in the local Ollama service."""
    try:
        with urllib.request.urlopen(
            f"{OLLAMA_URL}/api/tags", timeout=OLLAMA_STATUS_TIMEOUT
        ) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (
        urllib.error.URLError,
        TimeoutError,
        OSError,
        ValueError,
        UnicodeDecodeError,
        json.JSONDecodeError,
    ):
        return False

    models = result.get("models", []) if isinstance(result, dict) else []
    return any(
        isinstance(model, dict)
        and model.get("name", model.get("model")) == OLLAMA_MODEL
        for model in models
    )


def generate_ai_reply(message: str, history: Any) -> tuple[str | None, str]:
    reply = generate_ollama_reply(build_ollama_messages(message, history))
    return (reply, "ollama") if reply else (None, "demo")


def include_user_name_once(reply: str) -> str:
    """Ensure every assistant reply contains the user's name exactly once."""
    reply = str(reply).strip()
    name_pattern = re.compile(rf"\b{re.escape(PETER_USER_NAME)}\b", re.IGNORECASE)
    matches = list(name_pattern.finditer(reply))
    if not matches:
        return f"{PETER_USER_NAME}, {reply}"

    first = matches[0]
    prefix = reply[:first.start()]
    suffix = name_pattern.sub("", reply[first.end():])
    suffix = re.sub(r"\s+([,.;:!?])", r"\1", suffix)
    suffix = re.sub(r"[,;:]\s*([.!?])", r"\1", suffix)
    suffix = re.sub(r"([,.;:!?])\s*([,.;:!?])", r"\1", suffix)
    suffix = re.sub(r"\s{2,}", " ", suffix)
    return f"{prefix}{PETER_USER_NAME}{suffix}".strip()


def creator_reply_for(message: str) -> str | None:
    normalized = message.casefold()
    english_questions = (
        "who made you",
        "who created you",
        "who built you",
        "how were you made",
        "how you were made",
        "how is make you",
        "how did they make you",
        "why were you made",
    )
    roman_urdu_questions = (
        "kisne banaya",
        "kis ne banaya",
        "tumhe kisne banaya",
        "tum ko kisne banaya",
        "aapko kisne banaya",
        "sagar ne tumhe banaya",
        "sagar ne tum ko banaya",
    )
    if any(question in normalized for question in english_questions):
        return (
            f"{PETER_USER_NAME} created me for {PETER_PROFILE['project_name']} as "
            f"{PETER_PROFILE['purpose']}."
        )
    if any(question in normalized for question in roman_urdu_questions):
        return (
            f"{PETER_USER_NAME} ne mujhe {PETER_PROFILE['project_name']} ke liye "
            f"banaya, taaki main {PETER_PROFILE['purpose']} ban sakun."
        )
    return None


def validate_chat_request(data: Any) -> tuple[str, list[Any]]:
    """Validate the request envelope and bound the message size."""
    if not isinstance(data, dict):
        raise ValueError("A JSON object is required")
    message = data.get("message")
    if not isinstance(message, str):
        raise ValueError("Message must be text")
    message = message.strip()
    if not message:
        raise ValueError("Message is required")
    if len(message) > MAX_MESSAGE_CHARS:
        raise MessageTooLongError("Message is too long")
    history = data.get("history")
    return message, history if isinstance(history, list) else []


def is_open_file_task_request(message: str) -> bool:
    """Recognize explicit file-picker requests as a backend fallback."""
    request = re.sub(r"^peter[,\s]+", "", message.strip().casefold())
    request = re.sub(r"[.!?]+$", "", request)
    return bool(
        re.fullmatch(
            r"(?:(?:please|zara|plz|can you|could you|mujhe)\s+)*"
            r"(?:(?:open|choose|select)(?:\s+the)?(?:\s+(?:a|my))?"
            r"\s+(?:local\s+)?(?:file|document)|"
            r"(?:file|document)\s+(?:open|kholo|kholna|khol\s+na|"
            r"khol\s+do|select\s+karo|chuno))",
            request,
        )
    )


def is_trusted_browser_origin(origin: str | None) -> bool:
    """Allow browser requests from Peter's UI while keeping CLI clients usable."""
    return origin is None or origin == f"http://{HOST}:{PORT}"


def is_trusted_file_action_origin(origin: str | None) -> bool:
    """Require the exact local UI origin for actions that open local files."""
    return origin == f"http://{HOST}:{PORT}"


def save_peter_memory(memory: str) -> bool:
    """Save a short, explicitly requested memory to Peter's editable profile."""
    memory = memory.strip()
    if not memory or len(memory) > MAX_MEMORY_CHARS:
        return False

    with PROFILE_LOCK:
        profile = load_peter_profile()
        if memory in profile["reply_rules"]:
            return True
        profile["reply_rules"].append(memory)
        temporary_path = PROFILE_PATH.with_suffix(".tmp")
        try:
            temporary_path.write_text(
                json.dumps(profile, indent=2, ensure_ascii=False), encoding="utf-8"
            )
            temporary_path.replace(PROFILE_PATH)
        except OSError:
            logging.exception("Could not save Peter's requested memory.")
            try:
                temporary_path.unlink(missing_ok=True)
            except OSError:
                logging.warning("Could not remove Peter's temporary profile file.")
            return False
    return True


def memory_response_for(message: str) -> str | None:
    """Handle a user message that explicitly asks Peter to remember something."""
    for phrase in ("yaad rakhna", "remember that"):
        match = re.search(re.escape(phrase), message, re.IGNORECASE)
        if not match:
            continue
        memory = message[match.end():].strip(" \t:,.!?")
        if not memory:
            return "Please tell me what you would like me to remember."
        if save_peter_memory(memory):
            refresh_peter_profile()
            return f"I'll remember this for future replies: {memory}"
        return "I couldn't save that memory. Please try a shorter note."
    return None


class PeterPlanetHandler(http.server.SimpleHTTPRequestHandler):
    """Serve the web UI and local-only API endpoints."""

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def do_GET(self) -> None:
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/health":
            self.send_api_response({"status": "ok"})
            return
        if path == "/api/status":
            self.send_api_response(
                {
                    "status": "ok",
                    "backend": "running",
                    "version": "0.1.0",
                    "user_name": PETER_USER_NAME,
                    "services": {
                        "api": "active",
                        "ai_engine": "ollama" if ollama_model_available() else "demo",
                        "database": "disconnected",
                    },
                }
            )
            return
        super().do_GET()

    def do_POST(self) -> None:
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/open-file":
            self.handle_open_file()
            return
        if path != "/api/chat":
            self.send_api_response({"error": "Not found"}, status=404)
            return

        if not is_trusted_browser_origin(self.headers.get("Origin")):
            self.send_api_response({"error": "Untrusted request origin"}, status=403)
            return
        if self.headers.get_content_type() != "application/json":
            self.send_api_response(
                {"error": "Content-Type must be application/json"}, status=415
            )
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_api_response({"error": "Invalid Content-Length"}, status=400)
            return
        if content_length <= 0:
            self.send_api_response({"error": "Request body is required"}, status=400)
            return
        if content_length > MAX_REQUEST_BYTES:
            self.send_api_response({"error": "Request body is too large"}, status=413)
            return

        try:
            data = json.loads(self.rfile.read(content_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_api_response({"error": "Invalid JSON request"}, status=400)
            return

        try:
            message, history = validate_chat_request(data)
        except MessageTooLongError as error:
            self.send_api_response({"error": str(error)}, status=413)
            return
        except ValueError as error:
            self.send_api_response({"error": str(error)}, status=400)
            return

        refresh_peter_profile()
        if is_open_file_task_request(message):
            self.send_api_response(
                {
                    "reply": include_user_name_once(
                        "I can show a file picker for a document in Documents, "
                        "Downloads, or Desktop. Do you want to continue?"
                    ),
                    "mode": "demo",
                    "action": "open_file",
                }
            )
            return

        reply = memory_response_for(message) or creator_reply_for(message)
        mode = "demo"
        if reply is None:
            reply, mode = generate_ai_reply(message, history)
            if reply is None:
                reply = self.generate_demo_reply(message)
        self.send_api_response({"reply": include_user_name_once(reply), "mode": mode})

    def handle_open_file(self) -> None:
        if not is_trusted_file_action_origin(self.headers.get("Origin")):
            self.send_api_response({"error": "Untrusted request origin"}, status=403)
            return
        if self.headers.get_content_type() != "application/json":
            self.send_api_response(
                {"error": "Content-Type must be application/json"}, status=415
            )
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_api_response({"error": "Invalid Content-Length"}, status=400)
            return
        if content_length <= 0 or content_length > MAX_FILE_ACTION_REQUEST_BYTES:
            self.send_api_response({"error": "Invalid request body size"}, status=400)
            return
        try:
            data = json.loads(self.rfile.read(content_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_api_response({"error": "Invalid JSON request"}, status=400)
            return
        if data != {}:
            self.send_api_response({"error": "No file path should be provided"}, status=400)
            return

        try:
            opened_path = select_and_open_document()
        except (DocumentActionError, ValueError) as error:
            logging.warning("Document action failed: %s", error)
            self.send_api_response({"error": str(error)}, status=400)
            return

        if opened_path is None:
            self.send_api_response({"opened": False, "cancelled": True})
            return
        self.send_api_response({"opened": True, "filename": opened_path.name})

    def send_api_response(self, data: dict[str, Any], status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def generate_demo_reply(self, message: str) -> str:
        """Return a clearly labeled local response when Ollama is unavailable."""
        creator_reply = creator_reply_for(message)
        if creator_reply:
            return creator_reply
        normalized = message.casefold()
        if re.search(r"\b(?:hello|hi|salam|namaste)\b", normalized):
            return "Hello! I am Peter. How can I help?"
        if "status" in normalized:
            return "The frontend is active. The AI engine is not connected yet."
        if "module" in normalized or "show modules" in normalized:
            return "The module panel is ready. Some modules are still under development."
        return "Demo Mode is active, so I can't generate a full answer right now."

    def log_message(self, format: str, *args: Any) -> None:
        logging.debug(format, *args)


def run_server() -> None:
    with http.server.ThreadingHTTPServer((HOST, PORT), PeterPlanetHandler) as server:
        print(f"Serving on http://{HOST}:{PORT}")
        print(f"Serving static files from: {STATIC_DIR}")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")


if __name__ == "__main__":
    run_server()
