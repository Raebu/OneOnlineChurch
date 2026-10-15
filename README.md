# OneOnlineChurch

**The world is worshipping. You're invited.**

A global church discovery and community project. This repository now includes an early-stage responsive static web experience and a proposed technical foundation.

## Cloudflare Workers deployment

Static assets are served **only** from `./public/`. The transparent globe logo and cinematic Earth hero are real optimised images committed under `public/assets/`. Wrangler uses the checked-in `wrangler.jsonc`, so neither `node_modules/`, project documents, tests nor environment files can be published accidentally.

- **Build command:** `npm run build` (checks public files; no compilation required).
- **Deploy command:** `npx wrangler deploy` (or `npm run deploy`).
- **Cloudflare dashboard output directory:** `public` if an output directory is requested. The definitive directory is `assets.directory` in `wrangler.jsonc`.
- **Local preview:** `npm run preview` (requires dependencies installed).
- **Quality:** `npm run check` checks browser JS, site asset isolation and tests.

For locally opening the page, use `public/index.html` or serve `public/` with any static file server. The project requires no runtime API credentials to host this initial discovery site. Avoid using the repository root `.` as your public output directory.

## Status and safeguards
- This is **not a live church directory**. Verified churches, service schedules and actual live streams have **not yet been loaded**.
- The globe is illustrative, not a live geographic map.
- Search is browser-only against an intentionally empty catalogue.
- Community, prayer, registration and pastoral functions are **not active**.
- Accessibility, security, safeguarding, theological inclusion, legal notice and deployment require review before public launch.

## Project documents
- `docs/architecture.md` — foundation, decisions and delivery gates.
- `docs/content-policy.md` — draft theological inclusion and editorial standards.
- Google Drive holds the ordered product backlog and Phase 0 proposal documents.

## Priority next steps
1. Review GitHub CI result and fix any failures.
2. Formally approve the product and trust policies.
3. Recruit and verify churches, with explicit streaming/embedding rights.
4. Implement API-backed schedules and reliable live-status checking.
5. Test with church representatives and users with accessibility needs.
6. Deploy only when a production privacy statement, owner contact and rollback procedures exist.
