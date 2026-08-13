# Security Policy

## Local data

KeyFlow stores account and learning data locally. Users should protect the operating-system account that owns the application data directory.

## Reporting

Do not publish sensitive vulnerability details in a public issue. Contact the repository owner privately through the GitHub security/contact mechanism available for the project.

## Design expectations

- Passwords are hashed, never stored as plaintext.
- Core data remains local unless an explicitly designed future feature says otherwise.
- Agent tools should follow least privilege.
- Backups should be treated as sensitive user data.
- Future model integrations must not silently upload learner information.
