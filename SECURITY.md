# Security Policy

## Reporting a vulnerability

Open a private security advisory via GitHub:
https://github.com/xaviergmail/deadlock-helpful-info/security/advisories/new

Do not file a public issue for security reports.

Expect a first response within 7 days.

## Scope

This is a static site with no backend or user data. Likely security issues:

- Cross-site scripting via user-controlled URL hash fragments
- Subresource integrity for any externally-hosted assets (none currently)
- GitHub Actions workflow misconfiguration

Out of scope: anything requiring a server, accounts, or authenticated requests.
