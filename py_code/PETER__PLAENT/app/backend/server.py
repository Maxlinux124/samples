#!/usr/bin/env python3
import json
import http.server
import re
import urllib.error
import urllib.parse
import urllib.request
import os
import mimetypes
from pathlib import Path

STATIC_DIR = Path(__file__).parent.parent / "frontend"
PORT, HOST = 8000, "127.0.0.1"
OLLAMA_URL = os.environ.get("PETER_OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("PETER_OLLAMA_MODEL", "qwen2.5:0.5b")
PROFILE_PATH = Path(__file__).with_name("peter_profile.json")

DEFAULT_PROFILE = {
    "assistant_name": "Peter",
    "creator_name": "Sagar",
    "project_name": "Peter Planet",
    "purpose": "assistant",
    "personality": "Warm",
    "languages": ["Hinglish"],
    "reply_rules": ["Include user name"],
    "boundaries": "None"
}

def load_peter_profile():
    try:
        p = json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
        return {**DEFAULT_PROFILE, **p}
    except:
        return DEFAULT_PROFILE.copy()

def save_peter_memory(r):
    try:
        p = load_peter_profile()
        if "reply_rules" not in p: 
            p["reply_rules"] = []
        if r not in p["reply_rules"]:
            p["reply_rules"].append(r)
            PROFILE_PATH.write_text(json.dumps(p, indent=2, ensure_ascii=False), encoding="utf-8")
            return True
    except: 
        pass
    return False

def build_system_prompt(p, u):
    return f"You are {p['assistant_name']}, created by {u}. Rules: {' '.join(p['reply_rules'])}"

def refresh_peter_profile():
    global PETER_PROFILE, PETER_USER_NAME, SYSTEM_PROMPT
    PETER_PROFILE = load_peter_profile()
    PETER_USER_NAME = PETER_PROFILE["creator_name"]
    SYSTEM_PROMPT = build_system_prompt(PETER_PROFILE, PETER_USER_NAME)

refresh_peter_profile()

def ollama_model_available():
    try:
        with urllib.request.urlopen(f"{OLLAMA_URL}/api/tags", timeout=1) as r: 
            return True
    except: 
        return False

def generate_ollama_reply(m, h):
    conv = [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": m}]
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/chat", 
        data=json.dumps({"model": OLLAMA_MODEL, "messages": conv, "stream": False}).encode("utf-8"), 
        headers={"Content-Type": "application/json"}, 
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            return res["message"]["content"].strip()
    except: 
        return None

class PeterPlanetHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, f, *a): 
        pass
        
    def do_GET(self):
        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            status = {"ollama_connected": ollama_model_available(), "model": OLLAMA_MODEL}
            self.wfile.write(json.dumps(status).encode("utf-8"))
            return
            
        t = STATIC_DIR / self.path.lstrip("/")
        if self.path == "/": 
            t = STATIC_DIR / "index.html"
            
        if t.exists():
            self.send_response(200)
            m, _ = mimetypes.guess_type(str(t))
            self.send_header("Content-Type", m or "text/html")
            self.end_headers()
            self.wfile.write(t.read_bytes())

    def do_POST(self):
        if self.path == "/api/chat":
            l = int(self.headers.get("Content-Length", 0))
            b = json.loads(self.rfile.read(l).decode("utf-8"))
            m = b.get("message", "").strip()
            rep = None
            
            for w in ["yaad rakhna", "remember that"]:
                if w in m.lower():
                    r_str = m[m.lower().find(w)+len(w):].strip(" :,.?!Source")
                    if save_peter_memory(r_str): 
                        refresh_peter_profile()
                        rep = f"Theek hai {PETER_USER_NAME}, maine yeh baat permanently apne json me save kar li hai: {r_str}"
            
            if not rep: 
                rep = generate_ollama_reply(m, b.get("history", []))
            if not rep: 
                rep = "Local AI service currently loading framework parameters."
            if PETER_USER_NAME not in rep: 
                rep = f"{PETER_USER_NAME}, {rep}"
                
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"reply": rep, "source": "ollama"}).encode("utf-8"))

if __name__ == "__main__":
    print(f"Starting server on http://{HOST}:{PORT}")
    http.server.HTTPServer((HOST, PORT), PeterPlanetHTTPRequestHandler).serve_forever()
