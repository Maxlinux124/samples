#!/usr/bin/env python3
"""
Peter Planet Backend Server
A simple HTTP server that serves the frontend and provides API endpoints.
"""

import json
import http.server
import re
import urllib.error
import urllib.parse
import urllib.request
import os
import mimetypes
from pathlib import Path

# Configuration
STATIC_DIR = Path(__file__).parent.parent / "frontend"
PORT = 8000
HOST = "127.0.0.1"
OLLAMA_URL = os.environ.get("PETER_OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("PETER_OLLAMA_MODEL", "qwen2.5:0.5b")
OLLAMA_TIMEOUT = 90
OLLAMA_STATUS_TIMEOUT = 1
MAX_HISTORY_MESSAGES = 12
MAX_MESSAGE_CHARS = 4000
PROFILE_PATH = Path(__file__).with_name("peter_profile.json")
DEFAULT_PROFILE = {
    "assistant_name": "Peter",
    "creator_name": "Sagar",
    "project_name": "Peter Planet",
    "purpose": "a friendly, local-first assistant for multilingual text and voice conversations",
    "personality": "Warm, natural, supportive, and conversational, like a familiar good friend, without pretending to be human or a romantic partner.",
    "languages": ["Hindi", "Urdu", "Hinglish", "Roman Urdu", "English"],
    "reply_rules": [
        "Reply in the user's language and writing style, including Roman Urdu when appropriate.",
        "Include the user's configured name exactly once in every reply.",
        "Never echo the user's question as the answer.",
        "Respond kindly when the user shares a problem or low mood.",
    ],
    "boundaries": "Do not claim to control the computer, access private files, or use integrations unless Peter Planet explicitly provides them.",
}


def load_peter_profile():
    """Load Peter's editable persona profile, falling back safely if invalid."""
    try:
        profile = json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
        if not isinstance(profile, dict):
            raise ValueError("Profile root must be a JSON object")
        merged = {**DEFAULT_PROFILE, **profile}
        for key in ("languages", "reply_rules"):
            if not isinstance(merged[key], list) or not all(isinstance(item, str) for item in merged[key]):
                raise ValueError(f"Profile field '{key}' must be a list of strings")
        for key in ("assistant_name", "creator_name", "project_name", "purpose", "personality", "boundaries"):
            if not isinstance(merged[key], str) or not merged[key].strip():
                raise ValueError(f"Profile field '{key}' must be a non-empty string")
        return merged
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(f"Warning: Peter profile could not be loaded ({error}); using built-in defaults.")
        return DEFAULT_PROFILE.copy()


def build_system_prompt(profile, user_name):
    return " ".join((
        f"You are {profile['assistant_name']}, created by {user_name} for {profile['project_name']}.",
        f"Your purpose is {profile['purpose']}.",
        f"Your personality is: {profile['personality']}",
        f"Languages: {', '.join(profile['languages'])}. Reply in the same language and writing style the user used.",
        "If Hindi or Urdu is typed in Latin letters, reply in Latin letters too.",
        "Never echo or quote the user's request as the answer; provide a useful, direct response.",
        "When the user shares a problem or low mood, acknowledge it kindly and ask one gentle follow-up.",
        f"Profile rules: {' '.join(profile['reply_rules'])}",
        profile["boundaries"],
    ))


def refresh_peter_profile():
    """Reload the editable profile so changes apply to the next chat request."""
    global PETER_PROFILE, PETER_USER_NAME, SYSTEM_PROMPT
    PETER_PROFILE = load_peter_profile()
    PETER_USER_NAME = os.environ.get("PETER_USER_NAME", PETER_PROFILE["creator_name"]).strip() or PETER_PROFILE["creator_name"]
    SYSTEM_PROMPT = build_system_prompt(PETER_PROFILE, PETER_USER_NAME)


refresh_peter_profile()


def build_ollama_messages(message, history):
    """Return a bounded, validated conversation for the local model."""
    conversation = []
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

    if not conversation or conversation[-1] != {"role": "user", "content": message}:
        conversation.append({"role": "user", "content": message[:MAX_MESSAGE_CHARS]})

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        *conversation[-MAX_HISTORY_MESSAGES:],
    ]


def generate_ollama_reply(messages):
    """Ask the configured local Ollama model; return None if it is unavailable."""
    request = urllib.request.Request(
        f"{OLLAMA_URL}/api/chat",
        data=json.dumps({"model": OLLAMA_MODEL, "messages": messages, "stream": False}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=OLLAMA_TIMEOUT) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError):
        return None

    if not isinstance(result, dict):
        return None
    model_message = result.get("message")
    if not isinstance(model_message, dict):
        return None
    reply = model_message.get("content")
    return reply.strip()[:MAX_MESSAGE_CHARS] if isinstance(reply, str) and reply.strip() else None


def ollama_model_available():
    """Check whether the configured model is installed in the local Ollama service."""
    try:
        with urllib.request.urlopen(f"{OLLAMA_URL}/api/tags", timeout=OLLAMA_STATUS_TIMEOUT) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError):
        return False

    models = result.get("models", []) if isinstance(result, dict) else []
    return any(
        isinstance(model, dict)
        and model.get("name", model.get("model")) == OLLAMA_MODEL
        for model in models
    )


def generate_ai_reply(message, history):
    reply = generate_ollama_reply(build_ollama_messages(message, history))
    return (reply, "ollama") if reply else (None, "demo")


def include_user_name_once(reply):
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


def creator_reply_for(message):
    normalized = message.casefold()
    english_questions = (
        "who made you", "who created you", "who built you", "how were you made",
        "how you were made", "how is make you", "how did they make you", "why were you made",
    )
    roman_urdu_questions = (
        "kisne banaya", "kis ne banaya", "tumhe kisne banaya", "tum ko kisne banaya",
        "aapko kisne banaya", "sagar ne tumhe banaya", "sagar ne tum ko banaya",
    )
    if any(question in normalized for question in english_questions):
        return f"{PETER_USER_NAME} created me for {PETER_PROFILE['project_name']} as {PETER_PROFILE['purpose']}."
    if any(question in normalized for question in roman_urdu_questions):
        return f"{PETER_USER_NAME} ne mujhe {PETER_PROFILE['project_name']} ke liye banaya, taaki main {PETER_PROFILE['purpose']} ban sakun."
    return None

class PeterPlanetHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Set the directory to serve static files from
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path

        # API routes
        if path == "/api/health":
            self.send_api_response({"status": "ok"})
        elif path == "/api/status":
            self.send_api_response({
                "status": "ok",
                "backend": "running",
                "version": "0.1.0",
                "services": {
                    "api": "active",
                    "ai_engine": "ollama" if ollama_model_available() else "demo",
                    "database": "disconnected"
                }
            })
        else:
            # Serve static files
            super().do_GET()

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path

        if path == "/api/chat":
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "Bad Request: Empty body")
                return

            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode('utf-8'))
                if not isinstance(data, dict):
                    self.send_api_response({"error": "A JSON object is required"}, status=400)
                    return
                message = data.get("message", "")
                if not isinstance(message, str):
                    self.send_api_response({"error": "Message must be text"}, status=400)
                    return
                message = message.strip()
                if not message:
                    self.send_api_response({"error": "Message is required"}, status=400)
                    return
                if len(message) > MAX_MESSAGE_CHARS:
                    self.send_api_response({"error": "Message is too long"}, status=413)
                    return

                refresh_peter_profile()
                reply = creator_reply_for(message)
                if reply:
                    mode = "ollama" if ollama_model_available() else "demo"
                else:
                    reply, mode = generate_ai_reply(message, data.get("history", []))
                    if mode == "demo":
                        reply = self.generate_demo_reply(message)
                reply = include_user_name_once(reply)
                self.send_api_response({
                    "reply": reply,
                    "mode": mode
                })
            except json.JSONDecodeError:
                self.send_error(400, "Bad Request: Invalid JSON")
            except Exception as e:
                self.send_error(500, f"Internal Server Error: {str(e)}")
        else:
            self.send_error(404, "Not Found")

    def send_api_response(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")  # For development, restrict in production
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def generate_demo_reply(self, message):
        """Generate a demo response based on the message."""
        normalized = message.lower()
        creator_reply = creator_reply_for(message)
        if creator_reply:
            return creator_reply
        if "status" in normalized:
            return "The frontend is active. The AI engine and Python backend are not connected yet."
        if "module" in normalized or "show modules" in normalized:
            return "The module panel is ready. Some modules are still under development."
        if "hello" in normalized or "hi" in normalized:
            return "Hello! I am Peter, your personal assistant. How can I help?"
        return "Hello! I am Peter. I received your message: \"{}\". This is a demo response.".format(message)

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        # Override to suppress default log messages if desired
        # print("%s - - [%s] %s" % (self.address_string(), self.log_date_time_string(), format%args))
        pass

def run_server():
    with http.server.ThreadingHTTPServer((HOST, PORT), PeterPlanetHandler) as httpd:
        print(f"Serving on http://{HOST}:{PORT}")
        print(f"Serving static files from: {STATIC_DIR}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.shutdown()

if __name__ == "__main__":
    run_server()