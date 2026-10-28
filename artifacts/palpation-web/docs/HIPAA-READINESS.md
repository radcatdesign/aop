# HIPAA readiness: Cloudflare, multiple practices

**Status: security foundation only. Not approved for real patient information.**

Reviewed September 16, 2026. No Cloudflare deployment or resource creation has occurred. No executed BAA, covered-service list, identity provider, production domain, or patient-data store has been verified.

## Implemented controls and their limits

| Control | Implementation | Limit |
|---|---|---|
| Deployment containment | Every Vite build excludes the clinical demo modules and sample records; production displays a readiness screen. | Local development still contains the prototype. Never expose Vite publicly or use it for patient care. |
| Verified identity | Worker validates Access JWT signature, RS256, issuer, audience, subject, expiry, issued-at and maximum age. | Requires a configured Access application and MFA policy. No live identity provider is connected. |
| Practice boundary | The nonclinical session endpoint checks active subject membership and practice status using bound SQL parameters on every request. Unknown roles and other practices are denied. | Patient APIs and full action-level permissions are not implemented. |
| Revocation | Disabling membership denies the next request; authorization results are not cached. | Secure administrative provisioning, IdP offboarding and server session revocation remain outstanding. |
| Patient API blocked | Only `GET /api/practices/:practiceId/session` exists. Other API paths return 404 and writes return 405. | No patient store, upload service, messaging service, export service or clinical operations exist. |
| Browser protections | Worker adds no-store, no-referrer, nosniff, framing denial, CSP, permissions restrictions and HSTS to assets and API responses. | Verify on the actual custom domain after deployment. Existing UI requires inline styles; inline scripts remain forbidden. |
| Demo cleanup | Explicit sample-only entry, end-demo action, reload after 5 minutes idle or 30 minutes total, checks on focus/visibility/page return. | Frontend cleanup is not authentication or guaranteed memory erasure. Suspended browsers run cleanup on resume. |
| External exposure reduced | Removed Google Fonts requests, receipt mail-app handoff, fake calendar feed and untrue encryption/compliance/audit claims. | Local demo still supports sample uploads/downloads and simulated actions. Never enter real patient data. |
| Safe failures | Missing settings, storage errors and invalid identities fail closed without returning/logging assertions or raw vendor errors. | Durable clinical audit and security monitoring are not implemented. |

## Cloudflare architecture

```text
Staff browser → Access + identity provider/MFA → Worker
                                                 ├─ authorization DB: practice membership
                                                 ├─ practice-scoped clinical store [outstanding]
                                                 ├─ private document store [outstanding]
                                                 └─ durable audit service [outstanding]
```

The configuration runs the Worker before all assets and serves only `dist`. workers.dev and preview URLs are disabled. Observability is disabled for this no-PHI foundation to avoid forwarding request data through an unreviewed logging configuration. Before live use, implement approved security logging/alerts with field allowlists, access controls, retention and vendor review. Wrangler usage metrics are disabled.

### Agreements and eligible services

Obtain a signed BAA and written coverage confirmation for every proposed product/feature: Workers, asset delivery, Access/Zero Trust, database, object storage, logs, backups, analytics and support access. Cloudflare’s HIPAA whitepaper describes a BAA offering; it does not establish that every product or account tier is covered. [Cloudflare HIPAA whitepaper](https://www.cloudflare.com/resources/assets/slt3lc6tev37/3PeVHvuZAh7p3tN77kIfhG/596a459dd1cfbc2ad6b1dbef36ff0eb1/BDES-1265_Privacy_Compliance_Whitepapers_HIPAA.pdf)

D1 is a **candidate** authorization binding/schema, not a claim of HIPAA eligibility. No D1 instance is provisioned. Choose PHI storage only after contract scope is established. If a needed Cloudflare service is excluded, select a covered backend and ensure excluded services do not process PHI. Encryption alone does not remove a cloud provider’s business-associate obligations. [HHS cloud guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)

### Configure the nonclinical session endpoint

1. Establish a reviewed custom domain and Access application covering every staff application path. Require unique identities, MFA and an explicit allow policy. Protect staging and alternate hostnames too.
2. Configure Worker-only `ACCESS_TEAM_DOMAIN` as the exact `https://your-team.cloudflareaccess.com` issuer, without a trailing slash, and `ACCESS_AUD` as the Access application audience. Never put credentials or authorization configuration in `VITE_` variables.
3. Set the Access application token duration to at most 30 minutes and test renewal. The Worker rejects assertions older than 30 minutes. This does not implement server-side idle expiry; add that before PHI use.
4. Bind an approved authorization database as `AUTH_DB`. If D1 is approved, add a `d1_databases` entry with `binding: "AUTH_DB"`, the real database name/ID, and `migrations_dir: "worker/migrations"`. Apply `0001_memberships.sql` to synthetic-data staging first. There are no default accounts or memberships.
5. Provision practice IDs and **verified Access subjects** through a reviewed administrative process. Rows default to inactive. Do not infer membership from email domains, submitted role/practice headers or unverified claims. Disabling a membership revokes its next request.
6. Verify the authorized session returns only practice ID, role and `patientDataEnabled: false`. Verify cross-practice access, revoked membership, missing JWTs and alternate origins against the deployed Worker.

Patient authentication will need a separate design; patient accounts must not reuse workforce roles. The prototype has no patient login. Access assertions must be verified at the origin, rather than trusting the presence of a header. [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)

## Required engineering before patient use

These are product release requirements, not a claim that every design choice below is a verbatim HIPAA mandate.

### Data isolation and authorization

- Put practice scope on every record, attachment, query, export, background job and audit event. Enforce ownership in the data-access layer with composite keys/constraints. Never fetch a record solely by a client-supplied record ID.
- Approve permissions for clinicians, reception, billing and administrators. Practice administration should not automatically grant unrestricted clinical access. Support access needs approval, a reason, time limits and auditing.
- Apply authorization to reads, edits, search, reports, bulk operations, exports and file downloads. Private object names are not authorization.
- Test two actual practices across all those operations, including concurrent requests, revoked staff, suspended practices and background tasks. Current tests cover only the session boundary.

### Storage, audit, sessions and integrity

- Use contract-covered encrypted storage, approved TLS, managed secrets/keys, least-privilege service credentials, key rotation and encrypted backups. Define recovery objectives and demonstrate restoration with synthetic records.
- Replace in-memory reducers with validated, transactional server operations. Preserve signed clinical note versions, amendments, author identity, timestamps and reasons for changes.
- Implement server session expiry, idle limits, revocation and sensitive-action reauthentication. Protect state-changing requests against cross-site requests; use secure cookie settings where applicable. Add rate limits and abuse monitoring.
- Store durable, tamper-resistant audit events for record views, changes, disclosures, exports, privilege changes and support access. Include actor, practice, resource identifier, action, outcome and server time; avoid note contents and credentials. Test audit failure handling and its ordering with clinical mutations.
- Implement private files, file type/size validation, malware handling and authorized downloads. Consent signatures need signer identity, consent/document version, integrity and timing evidence.
- Keep PHI out of URLs, browser persistence, ordinary email/calendar feeds, analytics, error payloads and AI tools unless the specific use, agreement and configuration are approved. Use an authenticated portal and minimal-content notifications.
- Assess field devices: encryption, supported OS/browser, screen locks, management, shared-device logout, printing/downloads and lost-device response. Browser code cannot enforce every physical/device safeguard.

## Organizational release evidence

| Workstream | Owner | Evidence needed |
|---|---|---|
| Applicability and legal roles | Privacy/legal lead with each practice | Covered-entity/business-associate analysis; applicable agreements with practices and downstream vendors |
| Risk management | Designated security official | System/data-flow inventory, risk analysis, mitigation decisions and residual-risk acceptance |
| Policies and workforce | Security/privacy leads | Training, access approval, offboarding, sanctions, acceptable use, device security and incident procedures |
| Patient rights | Privacy lead + product owner | Access, correction/export, disclosure workflows and applicable notices/minimum-necessary rules |
| Retention and disposal | Legal/privacy + engineering | Record-specific and jurisdiction-specific schedules, legal holds, deletion/backup lifecycle and vendor exit procedures |
| Incident readiness | Security lead | Breach assessment/notification process, contacts, evidence preservation and tabletop exercise |
| Continuity | Operations + engineering | Successful restore results and downtime/disaster-recovery procedures |
| Independent assessment | Security lead + reviewer | Authorization review, penetration testing, real deployment review and documented release approval |

HHS describes administrative, physical and technical safeguards, including risk assessment and policies. Passing software tests does not establish compliance. Security Rule documentation generally has a six-year retention requirement from creation or last effective date; that is **not** a universal clinical-record or audit-log retention period. [Current Security Rule summary](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)

The Privacy Rule does not prescribe a general medical-record retention term; other laws may do so. Determine retention for each practice and record type. [HHS retention FAQ](https://www.hhs.gov/hipaa/for-professionals/faq/580/does-hipaa-require-covered-entities-to-keep-medical-records-for-any-period/index.html)

Use effective rules and track proposed changes separately. [Security Rule proposal](https://www.hhs.gov/hipaa/for-professionals/security/hipaa-security-rule-nprm/index.html) · [Privacy Rule](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html) · [Breach notification](https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html)

## Validation and go-live gate

Run `npm test`, `npm run build`, `npm run check:worker`, and `npm audit`. Tests use generated signing keys and real SQLite behind the D1 query interface. These verify application logic/SQL; they do not verify live Access/D1 policy, infrastructure encryption, vendor controls or contracts.

Before real patient information, obtain evidence of:

- Executed agreements and confirmed coverage for the final service inventory.
- Working individual sign-in/MFA, scoped permissions, data isolation and revocation.
- Completed clinical backend, private storage, durable audit and patient-rights workflows.
- Successful backup restoration, retention, incident, offboarding and field-device procedures.
- Deployment verification and independent security/compliance assessment.

Keep the production readiness screen until those gates are satisfied. There is deliberately no environment flag that enables clinical data. This document is an implementation handoff, not a certification.

### Local evidence — September 16, 2026

- 13 automated tests passed, including wrong/expired identity assertions, cross-practice denial, revocation, unavailable services, blocked clinical routes, session expiry, response headers and build containment under development NODE_ENV.
- Production build and Cloudflare Worker packaging dry run passed; no resources were deployed.
- npm audit reported zero known vulnerabilities in the installed dependency graph. This is not proof that dependencies have no undiscovered vulnerabilities.
- Browser checks passed for local demo entry, office and field rendering, demo exit and production readiness screen; no browser errors occurred in the fresh verification tab.
