# Peter Planet Roadmap

This roadmap is a simple plan. **Planned** items are not built yet. **Implemented** items are the current reality.

## Legend
- ✅ Implemented
- 🛠️ Planned (not yet built)
- 📋 Future (later phase)

## Phase 0: Project structure only
- ✅ Project root selected
- ✅ Folder tree created
- ✅ Documentation files created
- ✅ .gitignore and .env.example created

## Phase 1: Local-first foundation (target: soon)
- 🔧 Python virtual environment
- 🔧 requirements.txt with empty or minimal content
- 🔧 app/cli entry point
- 🔧 core agent module (Peter Core)
- 🔧 SQLite database helper
- 🔧 logging setup
- 🔧 tests directory scaffolding

## Phase 2: Command-line interface
- 🔧 CLI commands for status, help, and basic settings
- 🔧 Input/output validation
- 🔧 Local data storage in data/
- 🔧 Log files in logs/

## Phase 3: Optional AI integrations (disabled by default)
- 🔧 Agent modules in agents/
- 🔧 Feature flag to enable/disable AI
- 🔧 Placeholder for external API auth (no keys stored)
- 🔧 .env.example for optional AI settings

## Phase 4: Workflows and automations
- 🔧 Workflow runner in workflows/
- 🔧 Example flows (task list, reminders, notes)
- 🔧 Safe handling of external services

## Phase 5: Jarvis-inspired future interface (planned, no frontend built)
- 🔧 Futuristic AI core visualization
- 🔧 Task dashboard
- 🔧 Module status panel
- 🔧 Activity logs view
- 🔧 Optional Web UI or terminal UI (decide later)

## Notes
1. This project is local-first. Cloud services and AI are optional.
2. Do not commit real credentials, secrets, or private data.
3. Never delete or overwrite user files without permission.
4. Use simple English for docs and comments.
5. Ask before pushing to GitHub or renaming folders.
