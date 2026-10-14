# Security and Safety for Peter Planet

This document explains security in plain, simple English. It is written for beginners.

## 1. Main goals
1. Keep user data private.
2. Never store secrets in source control.
3. Be safe when AI features are added later.
4. Help you understand what could go wrong.

## 2. What is safe today
1. The project is local-first. No cloud services are required.
2. AI integrations are disabled by default.
3. The `.gitignore` file protects local files.
4. No real secrets are included in the repository.

## 3. What you should never commit
1. Real `.env` files
2. SQLite databases that contain private data
3. Log files that may contain passwords or tokens
4. AI API keys, tokens, or credentials
5. Personal information stored outside `data/`

## 4. Environment variables
We use a `.env.example` file only as a template. Example:
   AI_ENABLED=false
   AI_API_KEY=ADD_YOUR_KEY_HERE

Never edit `.env.example` to add real values. Instead, copy it to `.env` and fill in your real values locally.

## 5. Secrets and credentials
1. Do not add real secrets to `integrations/`.
2. Use environment variables for any future API keys.
3. Rotate or remove secrets if you suspect they are leaked.

## 6. Data safety
1. Back up `data/` before making major changes.
2. If you use SQLite, follow SQLite backup best practices.
3. Do not store passwords or tokens in plain text files.

## 7. Future AI safety
When AI features are added later:
1. Only enable AI features after reading the docs.
2. Keep AI calls isolated and logged.
3. Do not send private data to external APIs unless you have a clear plan.
4. Use a feature flag to disable AI by default.

## 8. Bug and incident response
1. If you think a secret is exposed: remove it and rotate credentials.
2. Check `logs/` for errors.
3. Ask a senior developer or maintainer before changing core code.
