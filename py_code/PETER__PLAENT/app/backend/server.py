#!/usr/bin/env python3
"""
Peter Planet Backend Server
A simple HTTP server that serves the frontend and provides API endpoints.
"""

import json
import http.server
import socketserver
import urllib.parse
import os
import mimetypes
from pathlib import Path

# Configuration
STATIC_DIR = Path(__file__).parent.parent / "frontend"
PORT = 8000
HOST = "127.0.0.1"

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
                    "ai_engine": "demo",
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
                message = data.get("message", "").strip()
                if not message:
                    self.send_api_response({"error": "Message is required"}, status=400)
                    return

                # Process the message (demo response)
                reply = self.generate_demo_reply(message)
                self.send_api_response({
                    "reply": reply,
                    "mode": "demo"
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
    with socketserver.TCPServer((HOST, PORT), PeterPlanetHandler) as httpd:
        print(f"Serving on http://{HOST}:{PORT}")
        print(f"Serving static files from: {STATIC_DIR}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.shutdown()

if __name__ == "__main__":
    run_server()