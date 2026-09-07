# Application structure and migration policy

The web root remains the public document root during the migration. Existing
root-level PHP files are public routes and must retain their names until all
links, redirects, SEO rules, and deployment settings have been verified.

`app/` contains framework-free shared application code. Its bootstrap is
side-effect free: database configuration is loaded only when a caller requests
`app_database_connection()`, preserving the production-only `db.php` setup.

`uploads/` remains a public, deployment-managed directory. It is intentionally
not moved because image URLs and upload handlers use that path directly.

Future phases may add `app/Views`, `assets/css`, and `assets/js` while leaving
route compatibility files at the document root.
