# Cloudflare security foundation implementation plan

**Goal:** Prepare a multi-practice security boundary while preventing this browser prototype from being mistaken for a patient-ready system.

**Architecture:** Keep the synthetic-data prototype available only in local development. Production builds contain a readiness page. A Cloudflare Worker validates Access identity and looks up active practice membership in a server-side database before returning a nonclinical session response. All clinical API routes remain unavailable.

**Tech stack:** React, Vite, Cloudflare Workers, jose, Node test runner; SQL membership schema compatible with D1. D1 is a candidate, not an assertion of BAA coverage.

**Constraints:** No real patient data, no cloud deployment, no compliance certification claim, no frontend authorization substitute. Cloudflare service eligibility and executed contracts are prerequisites to selecting a PHI store. Execute inline in this session.

## 1. Boundary tests

- [x] Add `tests/security.test.mjs`: signed test JWTs, wrong signature/issuer/audience/expiry, no token, missing configuration, active and revoked memberships, two practices, malicious practice IDs, role failures, no clinical routes, no caching, static response headers. Use a real SQLite database adapter for the D1 query interface.
- [x] Run the initial security tests; dependency installation was required before execution. The build-containment regression was observed failing before its guard was implemented.
- [x] Implement `worker/auth.js`, `worker/index.js`, `worker/migrations/0001_memberships.sql`, `security/headers.js`; require RS256, issuer, audience, subject, iat, exp; deny unrecognized roles and missing services.
- [x] Run tests and resolve failures.

## 2. Demo containment

- [x] Add session lifecycle tests for inactivity, absolute duration, expired activity, clock rollback.
- [x] Implement `src/session.js` and `src/SecurityBoundary.jsx`: explicit demo entry, clear sample-only status, end-session reload, expiry cleanup, no browser persistence.
- [x] Update `src/main.jsx` to import the demo only only when the Vite command is the local development server. Add production readiness screen and tests examining the generated artifact for absence of demo code.
- [x] Remove remote font dependency, misleading security claims, external receipt composition, and fake calendar feed.
- [x] Add shared response headers to Vite and Worker; configure Worker to run before all static assets.

## 3. Evidence and handoff

- [x] Document current controls, remaining controls, Cloudflare configuration, risk register, release gates and owners in `docs/HIPAA-READINESS.md`.
- [x] Run tests, production build, Worker bundling dry run and dependency audit.
- [x] Verify local demo entry/exit, field view, and production readiness screen in a browser.
- [x] Report implemented foundation separately from outstanding deployment and compliance obligations.

## Verified result

On September 16, 2026: 13 automated tests passed; production build and Cloudflare packaging dry run passed; npm audit reported zero known vulnerabilities. Browser checks confirmed local entry, office/field rendering, end-demo cleanup and the production readiness screen. No cloud deployment occurred. Production identity, patient services, durable audit, contracts and organizational controls remain outstanding as documented in HIPAA-READINESS.md.
