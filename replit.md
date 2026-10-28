# Art of Palpation

Office web app and native field companion adapted from the user's uploaded massage-practice prototype.

## Safety boundary

This is an invitation-only, synthetic-data beta, not a production patient-record system or a HIPAA-compliant deployment. Keep clinical data in session memory only. Do not enable patient use, payments, or messaging without an explicit implementation and compliance review.

The private beta uses verified Clerk identities and server-controlled approval. Approved testers can access the sample workspace in development and production after acknowledging its synthetic-only restriction. Demo sessions expire after five idle minutes or thirty total minutes. Web and native clinical sample sessions do not sync.

**Why:** The creator authorized a private beta, not real clinical use. Persistent storage is limited to beta accounts, invite requests, feedback, and allowlisted usage events. Never include assessment text, patient/client identifiers, or payment details in telemetry or feedback.

## Beta administration

- Bootstrap admin identity is configured through `BETA_BOOTSTRAP_ADMIN_EMAIL`, not a source-code address or a first-signup rule. Verification is mandatory; subsequent permissions come from the database.
- Invitations are approved by an admin and tied to the applicant's verified email. Approval is not an email-delivery claim; admins share the sign-in link manually.
- Admins review invite requests, manage beta access and roles, triage feedback, and view aggregate usage.
- Authentication and beta metadata persist; sample clinical edits remain ephemeral.
- Flow-step reports attach only opaque flow/step identifiers to stored feedback; user-editable flow titles and step notes remain in session memory because they could contain sensitive details.
- Popup motion should be a clean, subtle fade up, without zoom or bounce.

The uploaded source and its readiness documentation are preserved in `artifacts/palpation-web`; native implementation lives in `artifacts/palpation-mobile`.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
