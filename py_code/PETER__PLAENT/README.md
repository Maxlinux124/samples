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
From the project root, run `.\.venv\Scripts\python.exe app\backend\server.py` to start the local backend, then open `http://127.0.0.1:8000/`. The immersive galaxy interface loads its Three.js module from `app/frontend/vendor`, with no CDN dependency.
Chat is labeled Demo Mode when the backend reports canned responses. Optional panels expose verified service status, session activity and modules marked Coming Soon. The Three.js scene caps canvas resolution and animation rate, pauses while the tab is hidden, and has a CSS visual fallback if WebGL initialization fails.

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
