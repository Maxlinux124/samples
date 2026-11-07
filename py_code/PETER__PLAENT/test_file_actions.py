import io
import os
import tempfile
import unittest
from email.message import Message
from pathlib import Path
from unittest.mock import patch

from app.backend import server


class TestDocumentActions(unittest.TestCase):
    def test_chat_detects_open_file_requests_for_backend_fallback(self):
        requests = (
            "open a file",
            "Peter, open a file",
            "file kholo",
            "mujhe document khol na",
        )
        for request in requests:
            with self.subTest(request=request):
                self.assertTrue(server.is_open_file_task_request(request))

    def test_chat_does_not_treat_general_file_questions_as_open_requests(self):
        requests = (
            "How do I organize files?",
            "Explain this file",
            "open YouTube",
        )
        for request in requests:
            with self.subTest(request=request):
                self.assertFalse(server.is_open_file_task_request(request))

    def test_chat_endpoint_returns_file_action_instead_of_calling_model(self):
        handler = object.__new__(server.PeterPlanetHandler)
        handler.path = "/api/chat"
        handler.headers = Message()
        handler.headers["Origin"] = f"http://{server.HOST}:{server.PORT}"
        handler.headers["Content-Type"] = "application/json"
        payload = b'{"message":"open a file","history":[]}'
        handler.headers["Content-Length"] = str(len(payload))
        handler.rfile = io.BytesIO(payload)

        with patch.object(server, "refresh_peter_profile"):
            with patch.object(
                server.PeterPlanetHandler, "send_api_response"
            ) as response:
                with patch.object(server, "generate_ai_reply") as generate_reply:
                    handler.do_POST()

        self.assertEqual(response.call_args.args[0]["action"], "open_file")
        self.assertIn("show a file picker", response.call_args.args[0]["reply"])
        generate_reply.assert_not_called()

    def test_file_action_requires_the_exact_local_browser_origin(self):
        self.assertTrue(
            server.is_trusted_file_action_origin(
                f"http://{server.HOST}:{server.PORT}"
            )
        )
        self.assertFalse(server.is_trusted_file_action_origin(None))
        self.assertFalse(
            server.is_trusted_file_action_origin("https://example.com")
        )

    def test_validate_document_path_allows_supported_files_in_allowed_folders(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            document = root / "notes.txt"
            document.write_text("A local note", encoding="utf-8")

            with patch.object(server, "get_allowed_document_roots", return_value=(root,)):
                self.assertEqual(server.validate_document_path(str(document)), document)

    def test_validate_document_path_rejects_unsupported_extensions(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with patch.object(server, "get_allowed_document_roots", return_value=(root,)):
                unsupported_files = (
                    "unsafe.exe",
                    "macros.docm",
                    "macros.xlsm",
                    "macros.pptm",
                )
                for filename in unsupported_files:
                    with self.subTest(filename=filename):
                        unsupported = root / filename
                        unsupported.write_text("not opened", encoding="utf-8")
                        with self.assertRaises(ValueError):
                            server.validate_document_path(str(unsupported))

    def test_validate_document_path_rejects_files_outside_allowed_folders(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            allowed = root / "Documents"
            outside = root / "Other"
            allowed.mkdir()
            outside.mkdir()
            document = outside / "notes.txt"
            document.write_text("A local note", encoding="utf-8")

            with patch.object(server, "get_allowed_document_roots", return_value=(allowed,)):
                with self.assertRaises(ValueError):
                    server.validate_document_path(str(document))

    @unittest.skipUnless(os.name == "nt", "Windows file associations are required")
    def test_open_document_uses_windows_file_association(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            document = root / "notes.txt"
            document.write_text("A local note", encoding="utf-8")

            with patch.object(server, "get_allowed_document_roots", return_value=(root,)):
                with patch.object(server.os, "startfile") as startfile:
                    opened = server.open_document(str(document))

            self.assertEqual(opened, document)
            startfile.assert_called_once_with(str(document))

    def test_open_file_endpoint_rejects_untrusted_origin_before_showing_picker(self):
        handler = object.__new__(server.PeterPlanetHandler)
        handler.path = "/api/open-file"
        handler.headers = Message()
        handler.headers["Origin"] = "https://example.com"

        with patch.object(server.PeterPlanetHandler, "send_api_response") as response:
            with patch.object(server, "select_and_open_document") as open_document:
                handler.handle_open_file()

        response.assert_called_once_with(
            {"error": "Untrusted request origin"}, status=403
        )
        open_document.assert_not_called()

    def test_open_file_endpoint_does_not_accept_a_client_file_path(self):
        handler = object.__new__(server.PeterPlanetHandler)
        handler.path = "/api/open-file"
        handler.headers = Message()
        handler.headers["Origin"] = f"http://{server.HOST}:{server.PORT}"
        handler.headers["Content-Type"] = "application/json"
        payload = b'{"path":"C:\\\\Users\\\\someone\\\\secret.txt"}'
        handler.headers["Content-Length"] = str(len(payload))
        handler.rfile = io.BytesIO(payload)

        with patch.object(server.PeterPlanetHandler, "send_api_response") as response:
            with patch.object(server, "select_and_open_document") as open_document:
                handler.handle_open_file()

        response.assert_called_once_with(
            {"error": "No file path should be provided"}, status=400
        )
        open_document.assert_not_called()

    def test_open_file_endpoint_reports_picker_cancellation_without_opening(self):
        handler = object.__new__(server.PeterPlanetHandler)
        handler.path = "/api/open-file"
        handler.headers = Message()
        handler.headers["Origin"] = f"http://{server.HOST}:{server.PORT}"
        handler.headers["Content-Type"] = "application/json"
        handler.headers["Content-Length"] = "2"
        handler.rfile = io.BytesIO(b"{}")

        with patch.object(server.PeterPlanetHandler, "send_api_response") as response:
            with patch.object(server, "select_and_open_document", return_value=None):
                handler.handle_open_file()

        response.assert_called_once_with({"opened": False, "cancelled": True})

    def test_open_file_endpoint_returns_only_the_opened_filename(self):
        handler = object.__new__(server.PeterPlanetHandler)
        handler.path = "/api/open-file"
        handler.headers = Message()
        handler.headers["Origin"] = f"http://{server.HOST}:{server.PORT}"
        handler.headers["Content-Type"] = "application/json"
        handler.headers["Content-Length"] = "2"
        handler.rfile = io.BytesIO(b"{}")
        selected_file = Path("C:/Users/example/Documents/notes.txt")

        with patch.object(server.PeterPlanetHandler, "send_api_response") as response:
            with patch.object(
                server, "select_and_open_document", return_value=selected_file
            ):
                handler.handle_open_file()

        response.assert_called_once_with(
            {"opened": True, "filename": "notes.txt"}
        )


if __name__ == "__main__":
    unittest.main()
