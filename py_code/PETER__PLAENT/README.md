# Peter Planet

Welcome to **Peter Planet** (internal code name: `peter-planet`).

This is a **local-first** personal assistant project. It starts with a command-line interface and a SQLite database. AI integrations are **optional and disabled by default**.

## Project goals
- Be a friendly, modular Python assistant named Peter.
- Central coordinator: **Peter Core**.
- Work on your computer without cloud services first.
- Keep secrets out of source control.

## Quick start (Phase 0)
1. Install Python 3.11+ from https://www.python.org.
2. Open this folder in VS Code.
3. Open a terminal and run:
     python --version

You should see a Python version message. Later, you will create a virtual environment and install packages.


## Frontend interface
From the project root, double-click `start_peter.bat` to start or reuse local Ollama and Peter's backend, then open `http://127.0.0.1:8000/`. Alternatively, run `\.venv\Scripts\python.exe app\backend\server.py` manually. The immersive galaxy interface loads its Three.js module from `app/frontend/vendor`, with no CDN dependency.
Chat is labeled Demo Mode when the backend reports canned responses. Optional panels expose verified service status, session activity and modules marked Coming Soon. The Three.js scene caps canvas resolution and animation rate, pauses while the tab is hidden, and has a CSS visual fallback if WebGL initialization fails.

### Optional local AI
Peter uses Ollama on this computer when the configured model is installed; otherwise chat safely falls back to Demo Mode. Install Ollama, then run `ollama pull qwen2.5:0.5b` before starting the backend. The defaults are `PETER_OLLAMA_URL=http://127.0.0.1:11434` and `PETER_OLLAMA_MODEL=qwen2.5:0.5b`; override them with environment variables if needed. Recent chat turns are sent only to the local Ollama service and are not saved by the backend.

Peter's editable brain lives in `app/backend/peter_profile.json`. Update its purpose, personality, languages, or reply rules there; changes apply to the next chat message without restarting. The default profile identifies `Sagar` as Peter's creator. The backend preserves that fact in its system prompt and answers common creator questions even in Demo Mode. Replies include the user's name once; set `PETER_USER_NAME` before starting the backend to change the default. Spoken replies use the selected browser voice at a slower rate for clarity.

## Project structure

PETER__PLAENT/
- app/
  - cli/
- core/
- agents/
- database/
- integrations/
- workflows/
- tests/
- data/
- logs/
- templates/
- docs/

- README.md
- ROADMAP.md
- ARCHITECTURE.md
- SECURITY.md
- CHANGELOG.md
- PETER_PLANET_MASTER_PLAN.md
- .gitignore
- .env.example

## Next steps
1. Review ARCHITECTURE.md and ROADMAP.md.
2. Approve the next phase.
3. Never add real secrets to .env. Use .env.example only.
4. Keep AI features behind a feature flag until you choose to enable them.
5. Ask before renaming folders or initializing a GitHub repository.

## Where to get help
See SECURITY.md and ARCHITECTURE.md. Ask the main maintainer before changing core logic.
