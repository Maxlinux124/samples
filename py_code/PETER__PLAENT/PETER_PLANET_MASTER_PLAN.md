

## Section C — Core principles

The development rules below apply to every future task.

1. **Build small, understandable components.** Each file and module should have one clear job.
2. **Teach the owner what each file and module does.** No unexplained large code dumps.
3. **Prefer simple, maintainable code over unnecessary complexity.** If a solution is too clever, rewrite it in simpler steps.
4. **Keep the system modular and extensible.** Add new capabilities by adding new files, not by rewriting existing ones.
5. **Keep local functionality available without an AI API.** The app should work without external AI.
6. **Make external AI integrations optional and disabled by default.** AI is an optional add-on, not the foundation.
7. **Do not add paid services without discussing costs and obtaining approval.**
8. **Never expose secrets or private customer data.**
9. **Require approval before sending emails, contacting leads, publishing content, or performing other consequential external actions.**
10. **Do not silently change the architecture or delete existing functionality.**

---

## Section D — System architecture

### D.1 Overview
Peter Core is the central coordinator. It does not replace the specialist modules. Instead, it decides which module should handle a request, sends the request, and returns the result to the caller.

A simplified request flow is:

1. **Start:** The user types a command in the CLI.
2. **CLI:** `app/cli` reads the command and validates simple input.
3. **Core:** `core` / Peter Core receives the command and decides the next step.
4. **Specialist modules:** Peter Core may ask a specialist agent, workflow, or database helper to do the work.
5. **Data layer:** Database helpers read or write SQLite data when needed.
6. **Response:** The result is returned to the user through the CLI.

This flow is a **design proposal**, not an implemented system.

### D.2 Planned component responsibilities

| Component | Purpose | Planned responsibilities | Status |
|---|---|---|---|
| Application and CLI | User entry point | Read commands, show help, show errors, keep the interface simple | Planned |
| Core / Peter Core | Central coordinator | Route requests, manage state, keep the system organized | Planned |
| Specialist agents | Focused tasks | Do one kind of job such as lead research, notes, or reporting | Planned |
| Database layer | Data storage | Create tables, save records, load records safely | Planned |
| Integrations | External services | Optional connections such as AI APIs or email; no keys stored | Planned |
| Workflows | Automation flows | Run a sequence of steps for a business need | Planned |
| Tests | Quality checks | Verify code behavior with small automated checks | Planned |
| Data and logs | Local files | Store non-sensitive data and event logs | Planned |
| Templates | Reusable layouts | Hold reusable text for reports, emails, or other future outputs | Planned |
| Documentation | Knowledge base | Keep architecture, rules, and status clear | Planned |
| Future user interface | Presentation | Dashboard, module status, task queue, and activity logs | Planned |

> The existing `ARCHITECTURE.md` already documents many of these ideas. The table above is the refined plan and should be kept consistent with that file. This section should not claim that these components are implemented.

# Peter Planet Master Project Plan

**Project:** Peter Planet  
**Project root:** `C:\xampp\htdocs\samples\py_code\PETER__PLAENT`  
**Project owner:** Sagar Sardar  
**Assistant identity:** Peter  
**Project hashtag:** `#PeterPlanet`  
**Tagline:** **One Vision. One AI Team. One Planet of Possibilities.**  
**Owner skill level:** Beginner in Python, with experience in website development, WordPress, HTML, CSS, JavaScript, PHP, MySQL, and basic SEO  
**Development environment:** Windows, VS Code, and Git  
**Initial goal:** Build a safe, modular, local-first Python foundation that can gradually grow into a business automation system  
**Long-term vision:** A personal AI-powered business operating environment with a futuristic, Jarvis-inspired interface  

> Purpose: this is the main planning and decision reference for the project. It is the single source of truth for architecture, development rules, project status, and future roadmap. Existing files such as `README.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `SECURITY.md`, and `CHANGELOG.md` are preserved and referenced as supporting documentation.

---

## Section A — Project identity and vision

### A.1 Project identity
- **Project name:** Peter Planet  
- **Internal code name:** `peter-planet`  
- **Project owner:** Sagar Sardar  
- **Assistant identity:** Peter  
- **Project hashtag:** `#PeterPlanet`  
- **Tagline:** **One Vision. One AI Team. One Planet of Possibilities.**  

### A.2 Purpose
Peter Planet is a local-first personal assistant that starts with a command-line interface and a SQLite database. It is safe, modular, and beginner-friendly. It will grow into a business automation system.

### A.3 Long-term vision
A personal AI-powered business operating environment with a futuristic, Jarvis-inspired interface. The system will:
- Work locally without paid cloud services.
- Keep AI optional and disabled by default.
- Preserve privacy and security by default.
- Allow the interface to change without rebuilding the whole system.

### A.4 Target users
- Primary owner: Sagar Sardar, a beginner in Python but experienced in web, WordPress, HTML, CSS, JavaScript, PHP, MySQL, and basic SEO.
- The project is designed for the owner to learn Python step by step.
- Future users may include small business owners or teams, but only after the project is stable and safe.

### A.5 Business problems Peter Planet aims to solve
- Organizing business leads, tasks, notes, and calls in one local place.
- Reducing manual paperwork and scattered files.
- Generating ideas for business strategy, SEO, proposals, and reports.
- Helping the owner learn Python in a practical, real-world project.
- Providing a safe environment for optional AI assistance without exposing private data.

---

## Section B — Current reality versus future plans

> Important: all statuses below are based on the current repository state as of creation. No Python application code exists yet in this repository.

### B.1 Implemented and verified
- ✅ Project root directory exists.
- ✅ Folder tree exists: `app/`, `app/cli/`, `core/`, `agents/`, `database/`, `integrations/`, `workflows/`, `tests/`, `data/`, `logs/`, `templates/`, `docs/`.
- ✅ Root documentation files exist: `README.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `SECURITY.md`, `CHANGELOG.md`, `.gitignore`, `.env.example`.
- ✅ `.gitignore` covers `.env`, local SQLite files, logs, and common editor files.
- ✅ `.env.example` contains no real secrets and is only a placeholder template.
- ✅ No application code has been written.

### B.2 Not implemented / planned


## Section E — Folder and file reference

> This section documents only what exists today. No placeholders were created to fill folders.

### E.1 Root files

| File | Purpose | Status |
|---|---|---|
| `README.md` | Welcome and quick start | Existing |
| `ROADMAP.md` | Simple future plan | Existing |
| `ARCHITECTURE.md` | High-level component explanation | Existing |
| `SECURITY.md` | Basic security guide | Existing |
| `CHANGELOG.md` | Concise change history | Existing |
| `.gitignore` | Files Git should ignore | Existing |
| `.env.example` | Example configuration with no secrets | Existing |

### E.2 Folders

| Folder | Purpose | Files it should contain | Files it should never contain | Current state |
|---|---|---|---|---|
| `app/` | User-facing application code, starting with the CLI | CLI commands, small input/output helpers | Business rules, secrets, real database data | Exists, empty |
| `app/cli/` | Command-line interface | Python files for terminal commands | Database secrets, API keys, real customer data | Exists, empty |
| `core/` | Central coordinator | Peter Core logic, routing helpers, main settings | No root-level application code | Exists, empty |
| `agents/` | Optional specialist helpers | Future AI or task helpers | Real secrets, payloads, emails | Exists, empty |
| `database/` | SQLite setup and helpers | Schema files, database helpers, migration helpers | Real private data stored in source | Exists, empty |


### E.3 Folder usage rules
- Never store secrets in any folder other than a local `.env` file that is ignored by Git.
- Never store private customer data in `data/` or logs.
- Never create a Python module in an empty folder just to make the folder look full.
- Folders are for the future. They will be filled only when a task has a clear purpose.

---

## Section F — Development workflow

Every future task must follow these mandatory steps.

1. **Understand the request.** Ask clarifying questions before writing code.
2. **Inspect relevant existing files.** Read the files that will be changed or called.
3. **Explain the proposed change in beginner-friendly language.** Use simple English.
4. **Identify affected files and dependencies.** List every file that will be added, changed, or called.
5. **Explain risks, limitations, and possible costs.** Include technical and monetary risks.
6. **Propose a small implementation plan.** Keep it minimal and reversible.
7. **Wait for approval when the task changes architecture, adds dependencies, connects external services, changes security-sensitive behavior, or performs consequential actions.**
8. **Implement only the approved scope.**
9. **Run appropriate tests and checks.** If tests cannot run, say so.
10. **Report exactly what changed, what passed, what failed, and what remains incomplete.**
11. **Update the relevant documentation and this master plan when a lasting decision or project status changes.**

### F.1 Small, authorized, low-risk changes
For clearly small and low-risk changes, do not ask repetitive approval questions. Follow the approved scope and report the change at the end.

### F.2 Forbidden shortcuts
- Do not write a full application and say it is ready before testing.
- Do not add a paid service without a cost discussion.
- Do not assume an API or service is configured.
- Do not delete or overwrite existing files without permission.

---

## Section G — Beginner learning rules



## Section H — Security and privacy

### H.1 Secrets and environment variables
- Use `.env.example` only as a placeholder template.
- Never put real secrets into source code or documentation.
- Copy `.env.example` to a local `.env` file when the project needs secrets.
- Keep `.env` in the operating system or local config, **not** in the repository.
- Never commit real API keys, passwords, tokens, or credentials.

### H.2 Git rules
- Add `.env`, local SQLite files, logs, and editor files to `.gitignore` where appropriate.
- Do not assume a rule is effective without checking it.
- Review `.gitignore` before committing. If a sensitive file can be tracked, treat it as a security risk.
- Never add personal customer data to the repository.

### H.3 Customer data
- Use synthetic or anonymized customer data during development.
- Do not perform unauthorized scraping or automatic contact with people.
- Do not store private customer data in the repository, source code, logs, or templates.
- Back up `data/` before major changes.

### H.4 Local databases and logs
- SQLite databases may contain private data. Keep them local and private.
- Log files may record operations. Do not log passwords, tokens, or personal data.
- Do not push local databases or logs to Git.

### H.5 External integrations and API keys
- External AI APIs, email, or other third-party services must remain optional and disabled by default.
- Any future API key must be read from environment variables, never written into code.
- A cost discussion is required before adopting external paid services.

---

## Section I — Future Jarvis-inspired interface

This section records the long-term interface vision. It is **not built now**.

### I.1 Planned interface elements
1. **Futuristic but professional dashboard**
   - A calm, modern screen that shows what Peter Planet is doing.
   - Must be optional and separate from business logic.
2. **Animated AI core visualization**
   - A visual center that shows Peter Core is active.
   - Animation and lights are presentation features, not the actual intelligence.
3. **Peter Core status**
   - Shows whether the core is online, healthy, or busy.
   - Shows enabled modules and current mode.
4. **Specialist module status**
   - Shows which modules are enabled, disabled, available, or failed.
5. **Task queue and progress**
   - Shows current tasks, pending items, and completed work.
6. **Activity and error logs**
   - Shows commands, tasks, errors, and warnings.
7. **Business lead and project panels**
   - A view for leads and projects that can be added later.
8. **Settings and security status**
   - Shows important system settings and warns about missing security steps.

### I.2 Interface separation rule
- The user interface must be separate from the core business logic.
- Changing the interface should not require rewriting the database or business rules.
- Keep the interface as one layer on top of a stable core.

---

## Section J — Planned specialist capabilities

4. **Website and SEO strategy generation**
   - Responsibility: Suggest basic SEO or website improvements.
   - Inputs: Website details or site summary.
   - Outputs: Forward-looking strategy ideas.
5. **Proposal and report drafting**
   - Responsibility: Draft a business proposal or report.
   - Inputs: Data and user notes.
   - Outputs: Draft document.
6. **Email drafting with explicit send approval**
   - Responsibility: Draft and review emails before sending.
   - Inputs: Recipient, subject, body template.
   - Outputs: Draft with clear approval step.
7. **Project and task tracking**
   - Responsibility: Keep tasks and projects in a central place.
   - Inputs: Tasks and projects.
   - Outputs: Task list and progress.
8. **Call-note organization**
   - Responsibility: Organize notes from calls or meetings.
   - Inputs: Raw notes.
   - Outputs: Cleaned, structured notes.
9. **Business performance reporting**
   - Responsibility: Summarize data in a simple report.
   - Inputs: Business data.
   - Outputs: Simple report.

### J.2 Responsibility rules
Each module must answer four questions:
1. What is the exact input?
2. What is the exact output?
3. What is its single responsibility?
4. What tests will prove it works?

---

## Section K — Technology and cost policy

### K.1 Intended starting technologies
- **Python** — the main language.
- **SQLite** — local database.
- **Git** — version control.
- **Windows + VS Code** — development environment.
- **Markdown** — documentation.

### K.2 Dependency policy
New libraries must be evaluated before adoption.
- **Purpose:** What problem does this library solve?
- **Maintenance:** Is it actively maintained?
- **Security:** Are there known security issues?
- **Cost:** Is it free, open source, or paid?
- **Controls:** Can we turn it off or replace it later?

If any answer is unclear or risks are unacceptable, do not adopt it without approval.

### K.3 Paid services and external APIs
- External AI APIs, hosting, cloud services, and other paid tools must remain optional.
- Any paid service requires a cost discussion before adoption.
- Do not promise that a subscription includes external API credits.
- Do not send private data to external services without a clear plan and approval.

---

## Section L — Phased roadmap

All phases are **pending** unless marked as verified.

| Phase | Objective | Expected deliverables | Dependencies | Risks | Approval required |


## Section M — Change management

Every meaningful change must record:
- **Date**
- **Change or decision**
- **Reason**
- **Files affected**
- **Tests or checks performed**
- **Risks and trade-offs**
- **Approval status**
- **Documentation updated**

### M.1 Changelog usage
- `CHANGELOG.md` is for concise implementation history.
- Record finished work, dependencies, and announcements there.

### M.2 Master plan usage
- This document is for durable decisions and overall project direction.
- It records architecture, rules, phases, security, and governance.

### M.3 Duplication rule
- If status is duplicated, this master plan owns the authoritative record.
- Other documents must be updated to match this document or clearly link to it.

---

## Section N — Definition of done

A task is complete only when:
1. Its approved requirements are implemented.
2. Relevant checks are performed.
3. Results are reported honestly.
4. Required documentation is updated.

### N.1 Rules
- If tests cannot run, say so.
- Never report a successful test that was not executed.
- Never claim a feature works unless the repository confirms it.
- Report incomplete work clearly.

---

## Section O — Current status and next action

### O.1 Verified current project status
- ✅ Project root exists.
- ✅ Required folders exist.
- ✅ Required documentation files exist.
- ✅ `.gitignore` and `.env.example` exist.
- ✅ No Python application code exists yet.
- ✅ AI integrations are planned and disabled by default.
- ✅ Future Jarvis-inspired interface is planned but not built.

### O.2 Decisions already made
- The project is local-first.
- AI is optional and disabled by default.
- Secrets are never committed to Git.
- `.env.example` is the only configuration template.
- `CHANGELOG.md` and this master plan will track changes.
- Existing documentation files will be preserved and will not be overwritten.
- The future interface stays separate from business logic.

### O.3 Decisions still open
- Exact coding style and library standards for Python.
- Whether to make a terminal UI or stay CLI-only for Phase 1.
- What exact SQLite schema to use for tasks.
- Whether AI conversations will be logged by default.
- Whether Git commits will be made by the owner or by the assistant with approval.

### O.4 Current blockers
- None technical, but the first real step is starting Phase 1 only after the owner approves. This phase will also require approval before installing any third-party packages.

### O.5 Recommended next step
Start **Phase 1: Python environment and a minimal local application**.

### O.6 Exact acceptance criteria for Phase 1
- A virtual environment is created and ready.
- `requirements.txt` is created with a clear comment explaining it is empty or minimal.
- A minimal command-line command can be run from the terminal.
- Running the command produces a simple, readable message.
- The command does not connect to the internet or send data anywhere.
- The project owner can run the command and reproduce the output.
- No third-party packages are installed unless explicitly approved.
- Documentation is updated to reflect the new state.

|---|---|---|---|---|---|
| **Phase 0: Project planning and documentation** | Create a safe structure and clear documentation | This master plan, README, ROADMAP, ARCHITECTURE, SECURITY, CHANGELOG, `.gitignore`, `.env.example` | None | Low | No |
| **Phase 1: Python environment and a minimal local application** | Get a local Python app running and testable | `requirements.txt`, virtual environment, minimal `app/cli` entry point, main runner | Python installed | Low | No for setup; approve dependencies before install |
| **Phase 2: Configuration, logging, SQLite, and task management** | Build local-first data and logging foundation | Logging setup, database helpers, task table, task manager, CLI commands for status | Phase 1 | Low | Yes if security-sensitive |
| **Phase 3: Optional AI provider interface** | Add AI support without disabling local work | Feature flag, AI provider base class, config placeholders | Phase 2 | Medium | Yes; disable by default by default |
| **Phase 4: CSV lead import, validation, and classification** | Let the user import and check leads safely | CSV import module, validation checks, duplicate detection, staging area | Phase 2 | Medium | Yes; no external calls without approval |
| **Phase 5: Business strategy generation** | Generate basic business ideas from data | Strategy module, plain-language recommendations | Phase 4 | Medium | Yes; no contact with people |
| **Phase 6: Email drafting and safe integration** | Draft emails and get explicit approval | Email draft module, approval step, no auto-send | Phase 5 | Medium | Yes; require explicit send approval |
| **Phase 7: Project tracking and reporting** | Track projects and generate simple reports | Task/project model, workflow runner, report module | Phase 2 and 6 | Low | No for internal reports |
| **Phase 8: Call notes and other optional business workflows** | Organize notes and expand workflows | Call-note organizer, safe workflow runner | Phase 7 | Medium | Yes for consequential workflows |
| **Phase 9: Jarvis-inspired dashboard** | Create a clean interface for the user | Dashboard separate from core, module status, task queue, activity logs | Phase 8 | Medium | Yes; UI must stay optional |
| **Phase 10: Testing, security review, and practical business evaluation** | Harden the project and evaluate usefulness | Automated tests, security review, practical evaluation | All previous phases | Medium | Yes; requires owner review |


Every future module should have a clear input, output, responsibility, and test strategy.

### J.1 Proposed modules
1. **Business lead research and CSV import**
   - Responsibility: Import lead data from CSV and prepare it for review.
   - Inputs: CSV file, optional filters.
   - Outputs: Cleaned list of leads, validation results.
2. **Data validation and duplicate detection**
   - Responsibility: Check for missing fields, bad values, and duplicates.
   - Inputs: Lead or task data.
   - Outputs: Validation report.
3. **Industry-specific business analysis**
   - Responsibility: Generate simple analysis for a chosen industry.
   - Inputs: Data and industry type.
   - Outputs: Simple analysis notes.

For every coding task, the following must be provided to the owner:

- Simple English explanations.
- Exact file paths.
- What each new file is for.
- Why the code is needed.
- How the modules connect.
- Exact terminal commands when required.
- Expected command output where useful.
- A simple verification procedure.
- Common errors and troubleshooting guidance.

> The goal is to make the owner feel confident, not overwhelmed. If more than a few lines of code are needed, explain the logic in small parts before showing the code.

| `integrations/` | Optional external services | Placeholders for future API connections | Real keys, passwords, customer data | Exists, empty |
| `workflows/` | Step-by-step automation flows | Workflow scripts and runners | Secrets, unverified external calls | Exists, empty |
| `tests/` | Automated checks | Test files for future modules | Production secrets, real customer data | Exists, empty |
| `data/` | Local non-sensitive data | CSV samples, exported data, local fixtures | Private customer data, secrets | Exists, empty |
| `logs/` | Log files | Event, warning, error, and debug logs | Passwords or keys inside logs | Exists, empty |
| `templates/` | Reusable layouts | Email templates, report layouts, UI placeholders | Real private data | Exists, empty |
| `docs/` | Extra documentation | Developer notes, architecture notes | Secrets, real payloads | Exists, empty |

All of the following are **planned, not verified as working**:
- Python virtual environment.
- `requirements.txt`.
- Python application modules.
- CLI commands.
- SQLite schema and database helpers.
- Logging setup.
- Tests.
- Agent modules.
- Workflow runners.
- AI interface.
- Jarvis-inspired dashboard.

### B.3 Optional future ideas
These are long-term ideas but are **not required now**:
- Local web UI.
- Terminal UI using a third-party library.
- Voice command support.
- Paid cloud APIs or hosting.

### B.4 Blocked or awaiting approval
- Any change that adds dependencies.
- Any change that connects external services.
- Any change that sends email, contacts leads, or publishes content.
- Any change that hides or exposes secrets.
- Any change to the project directory name or structure.

### B.5 Status ownership
- `CHANGELOG.md` holds a concise implementation history.
- This master plan holds durable decisions and overall project direction.
- `ROADMAP.md` holds a simple phase overview.
- This document should be the authoritative reference for architecture, status, workflow, security, and governance. Where these files overlap, they must agree, and any conflict will be fixed by updating this document and the affected file.
