# Technical foundation (proposed)

The first release is a zero-dependency static website with no invented church listings. This deliberately avoids collecting sensitive personal data while verification, safeguarding and licensing procedures are established.

## Proposed next increment
- TypeScript web app with server rendering, managed PostgreSQL, scoped church manager access, API ingestion adapters and full-text search.
- Store Church, ChurchRepresentative, StreamSource, ServiceSchedule, Sermon, Event, Verification, AuditEvent and AccessibilityFeature with provenance and retention policies.
- Treat verified stream status and scheduled start times separately; preserve link fallbacks and attribution.
- Require a DPIA and safeguarding review before implementing member accounts, messages, prayer requests or mentoring.

## Security gates
No secrets in Git. Apply least-privilege credentials, CI checks, HTTPS, account MFA, review policies, privacy notice and escalation process. Staging, production deployment, database backup restoration and rollback remain unverified tasks.

## Roadmap
Phase 0 specification and frontend scaffold; Phase 1 verified churches and livestreams; Phase 2 moderated community; Phase 3 sermon search and multilingual learning; Phase 4 charity partnerships.
