# Peter Planet Architecture

This document explains how the main parts of the project fit together. It uses simple English.

## 1. Design principles
1. **Local-first**: The app works on your computer without cloud services.
2. **Modular**: Related code lives in its own folder.
3. **Secure**: Secrets are never committed; .gitignore protects them.
4. **Optional AI**: AI features are off by default.
5. **Beginner friendly**: Code and docs use clear, simple language.

## 2. Intended directory tree

peter-planet/
│
├── app/                     # User-facing application code (entry points, CLI commands)
├── core/                    # Central coordinator + core business logic (Peter Core)
├── agents/                  # Optional AI assistant modules (disabled by default)
├── database/                # Database setup, migrations, and SQLite helpers
├── integrations/            # Optional third-party service connections (API keys, secrets)
├── workflows/               # Step-by-step automation flows
├── tests/                   # Automated tests for the project
├── data/                    # Runtime data files (excludes secrets)
├── logs/                    # Log files generated while running
├── templates/               # Templates for email, reports, or UI later
├── docs/                    # Extra documentation beyond the root files
│
├── README.md                # Getting started + quick overview
├── ROADMAP.md               # Planned features and phases
├── ARCHITECTURE.md          # How components fit together
├── SECURITY.md              # Security basics for beginners
├── CHANGELOG.md             # Simple record of changes over time
├── .gitignore               # Files Git should not track
└── .env.example             # Example environment variables (no real secrets)

## 3. Core components

### app/
The user-facing part of the program. Right now it contains `app/cli`, the command-line interface.

### core/
The brain of the project. This folder holds **Peter Core**, the central coordinator. It connects other modules and manages main rules.

### agents/
Optional helper programs that perform tasks. AI-related helpers belong here. **AI integration is disabled by default.**

### database/
All code that reads and writes SQLite data. Includes setup, schema, and query helpers.

### integrations/
A safe place for external services like APIs. No real credentials are stored here.

### workflows/
Step-by-step automation flows. Each flow is a function that runs a small task.

### tests/
Automated checks for the code. We will add tests in a later phase.

### data/ & logs/
Local files created when the app runs. `data/` stores non-sensitive user data. `logs/` stores event and error logs.

### templates/
Reusable text layouts for future features such as email templates or reports.

### docs/
Extra documentation for developers and users.

## 4. Information flow

User types a command in the terminal.
  → app/cli reads the command.
  → core/Peter Core decides the next step.
  → core asks database, workflows, or agents as needed.
  → result comes back to the user.

## 5. Planned: Jarvis-inspired Peter Planet interface (future feature)
This is a **planned feature**. It is NOT built yet.

We plan to add a futuristic interface inspired by the Jarvis AI co-pilot style. The idea is to give Peter Planet a modern dashboard and voice/command feedback loop. The following elements are planned:

1. **Futuristic AI core visualization**
   - A visual center of the app that shows Peter Core is active.
   - Animated or light effects to make the assistant feel alive.
   - Minimal, calm themes that can run in the terminal or a simple web UI.

2. **Task dashboard**
   - A screen where the user can see tasks, notes, and settings.
   - Simple charts or lists of pending work.
   - Quick actions to add or mark a task as done.

3. **Module status panel**
   - A panel that shows the status of each module.
   - Shows which modules are enabled or disabled.
   - Highlights AI, database, and workflow status.

4. **Activity logs view**
   - A scrollable view of what the app did.
   - Shows commands run, tasks completed, errors, and warnings.
   - Helps the user trust the system by seeing what is happening.

## 6. Future interface options (decide later)
1. CLI-only (current plan)
2. Terminal UI with a library like `rich`
3. Local web UI with Flask or FastAPI
4. Voice command support (later phase)

## 7. Security notes
1. Keep secrets in a local `.env` file and ignore it in Git.
2. Use the `.env.example` file only as a template.
3. Never commit real API keys or passwords.
4. Use Python's built-in `logging` module for local logs.
