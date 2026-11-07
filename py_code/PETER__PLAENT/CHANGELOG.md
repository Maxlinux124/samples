# Changelog

This file keeps a simple record of changes. We use clear, simple language.

## [Unreleased]

### Added
- Project structure (Phase 0): folders and documentation files.
- README.md, ROADMAP.md, ARCHITECTURE.md, SECURITY.md, CHANGELOG.md.
- .gitignore and .env.example.
- Confirmed local document picker for supported files in Documents, Downloads, and Desktop.

### Changed
- None yet.

### Deprecated
- None yet.

### Removed
- None yet.

### Fixed
- Restored the backend chat, status, profile, and demo-mode behavior, with bounded request validation.
- Routed file-opening requests to the confirmed document picker instead of the AI model.

## Rules for the changelog
1. Add a new section under `[Unreleased]` when you finish work.
2. Mark completed items as **Added** or **Changed**.
3. Never include real secrets or private data.
4. Keep entries short and beginner-friendly.
