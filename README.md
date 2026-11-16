# School Management System (SMS)

A school management application with landing, superadmin, institute admin, teacher, student and parent portals. The current implementation uses React, Vite, Tailwind CSS, an Express API and Supabase integration.

## Implementation status

Portal screens and supporting services exist, but some workflows still use sample data, browser storage or simulated success responses. A screen's presence does not mean its workflow is persisted or verified across accounts.

The [portal audit](docs/portal-audit/README.md) documents source findings, priorities and acceptance criteria. It covers this repository, not a completed audit of 50 separate systems.

## Portals

| Portal | Areas represented in the source |
|---|---|
| Landing | Product information, plans, trial/inquiry flows and login entry |
| Superadmin | Institutes, users, subscriptions, modules, security, audit, support, templates and backup views |
| Institute admin | Enrollment, guardians, academics, attendance, exams, fees, staff, reports and communication |
| Teacher | Timetable, students, attendance, assignments, resources, marks and messages |
| Student | Learning, timetable, attendance, results, fees and account screens |
| Parent | Child selection, attendance, assignments, report cards, fees and communication |

## Latest audit deliverables

The audit package adds documentation and standalone reference assets. It does **not** change application behavior or apply the proposed styles to existing portals.

| File | Contents |
|---|---|
| [Audit and implementation plan](docs/portal-audit/README.md) | Per-portal Must-Have, Nice-to-Have and Remove lists; evidence; shared design system; data models; delivery sequence; QA runbook |
| [Reference CSS](docs/portal-audit/reference.css) | Light/dark tokens, button variants, form controls, keyboard focus and print rules |
| [Slip templates](docs/portal-audit/slip-templates.html) | Fictional unpaid invoice/challan and settled receipt examples |

### How to review the changes

1. Read the audit for findings and acceptance gates.
2. Open `docs/portal-audit/slip-templates.html` directly in a browser. Keep `reference.css` beside it so the styling loads.
3. Select **Print sample documents** to open print preview. Check A4 and Letter at 100% scale, margins, totals and separate document pages.
4. Review the CSS for reusable `.sms-button`, `.sms-button--primary`, `.sms-button--secondary`, `.sms-button--danger`, `.sms-field` and `.sms-slip` classes.
5. Use the audit's QA runbook to verify actual portal workflows in separate authenticated sessions.

The sample documents contain fictional values and are not valid invoices or proof of payment. Browser layout, print output and accessibility still require manual verification.

## Priority work remaining

- Enforce authentication and role/tenant authorization on private API endpoints.
- Replace production authentication fallback paths with a verified account/session lifecycle.
- Extend campus-level database policies with student, guardian and assigned-teacher access rules.
- Replace hard-coded parent records and simulated student actions with shared persistent workflows.
- Make payment settlement authoritative and idempotent before issuing receipts.
- Replace decorative QR patterns with valid, independently scannable encoding.
- Consolidate navigation, terminology, accessible dialogs and shared design tokens.

These are audit findings and proposed changes, not completed fixes. See the audit for evidence and testable completion definitions.

## Local development

Run commands from the repository root with Node.js and npm installed.

```bash
npm ci
```

If database integration is needed, copy `.env.example` to `.env` and configure the development project's values. Do not overwrite an existing local configuration.

Start the frontend:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). Vite is configured to use port **3000** and proxies `/api` requests to port **5000**.

For API-backed workflows, start the Express server in a separate terminal:

```bash
npm run server
```

The default health endpoint is [localhost:5000/api/health](http://localhost:5000/api/health). UI rendering alone does not verify API or database connectivity.

### Build and preview

```bash
npm run build
npm run preview
```

Preview also uses port 3000 by default; stop the development server first. Preview serves the built frontend and is not a replacement for the backend or production API routing.

## Supabase configuration

The example environment file provides:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:5000/api
```

Values prefixed with `VITE_` are client configuration. Keep privileged service credentials server-side and do not commit local secrets.

Review `supabase-schema.sql` against the intended development database before applying it. The audit identified schema/consumer differences, including `user_profiles` in the checked-in schema and `users` queried by authentication. The schema should not be treated as a complete, verified production migration set.

## Repository layout

```text
api/                         Serverless API handlers
server/                      Express server and authentication helpers
public/                      Favicon, manifest and public assets
src/
  components/common/         Shared dialogs, cards and document components
  components/layout/         Administrative navigation and headers
  context/                   Authentication, theme, data and toast state
  modules/                   Portal and domain views
  services/                  API, storage and domain services
  App.jsx                    Application composition and portal routing
  index.css                  Existing application styles and tokens
docs/portal-audit/           Audit, reference CSS and slip examples
supabase-schema.sql         Checked-in database schema
vite.config.js              Development, proxy and build configuration
```

## Verification

`npm run build` passed during the 16 November 2026 audit. This verifies bundling, not authorization, persistence or cross-portal correctness. No automated test script is currently declared in the root `package.json`.

Before accepting a workflow, test it with separate users and browser sessions: teacher to student assignment delivery, guardian-child isolation, attendance updates, draft/result publication, invoice/payment reconciliation, logout and session revocation. Run keyboard, responsive and print checks using the [QA runbook](docs/portal-audit/README.md).
