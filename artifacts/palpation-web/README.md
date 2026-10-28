# Art of Palpation · Office Solutions

A working React redesign of the supplied practice-management prototype.

## Open the app

```sh
npm install
npm run dev
```

Open the local URL printed by the development server and choose **Explore sample workspace**. Use synthetic information only. The demo clears after 5 minutes of inactivity or 30 minutes total.

## Security status

**Not ready for real patient information or a HIPAA-compliant deployment.** See [HIPAA readiness](docs/HIPAA-READINESS.md) for implemented controls and remaining release gates.

`npm run build` produces a readiness screen and excludes the clinical demo modules. The redesigned demo remains available locally with `npm run dev`. No environment setting enables patient use.

A Cloudflare Worker verifies Access assertions and active practice membership for a nonclinical session endpoint. All clinical API routes remain unavailable. No cloud resources, real identity provider, or patient database have been connected.

```sh
npm test                # Node 22.13+ (SQLite tests)
npm run build           # Readiness screen only
npm run check:worker    # Packaging dry run; does not deploy
npm audit
```

## Design

The shared interface uses a light workspace sidebar, emerald actions, neutral surfaces, system typography, restrained borders, and generous spacing. The new dashboard includes appointment filters, revenue history, actionable reminders, and team availability. Search pages and clients from the header or with Command/Ctrl + K. Mobile layouts include bottom tabs and a drawer for every section.

- `src/App.jsx` contains the original application workflows and the redesigned shell.
- `src/Dashboard.jsx` contains the rebuilt dashboard.
- `src/styles.css` contains the shared styling and responsive layouts.
- `src/FieldApp.jsx` and `src/field.css` contain the responsive field workspace, demo PIN lock, visit schedule, detailed assessment, signature pad, and demo checkout. Findings, signatures, and payment state are isolated by visit.
- The two original JSX files in the project root are preserved as source references.

## Prototype behavior

The app uses the supplied sample data, with June 16, 2026 as the practice's demonstration date. Data changes are held in memory and reset on refresh. Existing integrations, payments, messaging, and clinical controls remain prototype behavior; this UI rebuild does not connect backend services.

The dashboard labels completion accurately and derives missing-consent reminders from client records.
