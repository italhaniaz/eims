# School management portal audit

Audit date: 16 November 2026. Repository baseline: `34a137a`.

Scope: source inspection of this repository's six portals, shared components, server, schema and assets. One system was available; the other 49 systems were not inspected. UI presence is not proof of persisted behavior. No deployed tenant, authenticated browser session, external payment provider or database policy execution was verified. Apply this evidence model separately to every system in the portfolio.

Verification performed: `npm run build` passed (2,180 modules transformed). Reference files were checked for presence; browser layout, print rendering, screen-reader behavior and cross-account journeys remain unverified. No application behavior was changed by this audit package.

Evidence status: **Present** = implementation/view located; **Partial** = concrete incomplete path found; **Unverified** = requires runtime evidence; **Missing in repository** = not located in the inspected source. Must-Have is the core product baseline; optional modules become mandatory when sold/enabled for a tenant. P0 blocks production use; P1 blocks core-feature acceptance; P2 is enhancement work.

## 1. Portal-by-portal priorities

| Portal | Observed implementation | Must-Have | Nice-to-Have | Remove / consolidate | Acceptance gate |
|---|---|---|---|---|---|
| Landing | Feature, pricing, trial and login UI; separate demo-coming-soon page; inquiry schema | P1: truthful capability/plan descriptions; working login, inquiry/trial submission, contact, privacy and terms destinations; accessible mobile navigation | Guided demo, localization, status page, customer stories with permission | Unsupported integration claims; duplicate competing trial CTAs; dead links. Keep one primary conversion per section | Each link has a destination; one valid inquiry creates one durable record visible to superadmin after refresh; validation failures retain input; published prices match plan records |
| Superadmin | Dashboard, institutes, billing, modules, security, backups, audit, support and templates views | P0: authenticated server authorization, tenant isolation, privileged session controls and audited support access. P1: tenant lifecycle, entitlements, subscription ledger, support queue, verifiable backup/restore and immutable audit | Aggregate analytics, template rollout previews, enterprise SSO, scheduled reports | Simulated success/health/backup records in production; duplicate backup/settings entry points; separate platform-fee and school-fee terminology | Unauthenticated private requests return 401; wrong-role requests return 403; suspension prevents new access and invalidates existing access; restore into isolated tenant matches record counts and checksums |
| Institute admin | Extensive student, guardian, academics, attendance, exams, fees, HR, reports, communications and settings views | P0: scoped staff permissions and protected financial writes. P1: enrollment/guardian links; classes/terms; teacher assignments; attendance corrections; result publication; invoices/payments/refunds; notices; exports; activity history | Payroll, library, transport, hostels, inventory, advanced analytics (required only when enabled) | Merge report entry points into one hub; consolidate fees/invoices/family billing under Fees; consolidate communication entry points. Preserve distinct workflows and permissions | Enrollment creates one identity shared across portals; draft results remain private; invoice amount and balance match parent/student views to the smallest currency unit; corrections retain actor, reason and prior value |
| Teacher | Attendance, marks, timetable, resources, inbox and assignment views; portal quick-create assignment path uses local component state | P0: assigned-class/subject scope. P1: timetable, roster, attendance, assignments, submissions/feedback, draft marks, publication workflow, notices/messages | Makeup sessions, resource reuse, personal payroll view, offline attendance drafts | Separate assignment stores and duplicate composition flows; unrelated student financial-edit controls | Teacher creates an assignment; assigned student sees it in a separate browser within 5 seconds after successful save/refetch; unrelated class cannot read it; changes survive logout/login; marks cannot exceed configured range |
| Student | Broad dashboard/account/fee/learning UI; payment, leave and password handlers include alert-only success paths | P0: self-only data and real account security. P1: timetable, attendance, assignments/submission receipts, published results, notices, fee balance and receipt downloads | Self-service payments where policy allows; library/transport views; calendar export | False success alerts, editable official class/section through local profile overrides, duplicated demo records | Submission returns a durable ID and is visible to assigned teacher; failed upload preserves draft; password change revokes prior sessions; unpaid invoice cannot generate a paid receipt; official enrollment changes require authorized staff |
| Parent | Child switcher, fees, attendance, assignments, report-card and communication UI; children initialized from `INITIAL_CHILDREN`; messages/notifications initialized in state | P0: verified, revocable guardian-child access. P1: child switcher, attendance/leave, published results, fees/receipts, notices, school messages, consent/account settings | Consolidated family payment, meetings, authorized pickup, optional transport updates | Hard-coded children, fees, messages and receipt values; shared-browser profile keys without account scope; inconsistent voucher/challan/invoice labels | Two unrelated guardians see disjoint authorized children; revoked link loses access on next request; changing child updates every panel/export; family payment allocates exactly once and balances match admin ledger |

Parity means one authoritative record with appropriate role access, not identical menus for every role. Do not remove a feature solely because it appears in multiple portals.

## 2. Concrete findings and remediation

| Priority | Evidence | Action and completion definition |
|---|---|---|
| P0 | `server/server.js`: global middleware contains CORS, JSON parsing and telemetry; settings/billing/template handlers lack a shared authentication/authorization guard | Protect every private endpoint with verified session and capability checks; derive tenant from trusted identity. Test every route/method anonymously, as another tenant and as a lower-privileged role. Public inquiries/health need explicitly limited contracts. Deployment exposure is unverified |
| P0 | `server/authCore.js`: built-in accounts, fixed-salt fast SHA-256 password hashing and plaintext compatibility; `AuthContext.jsx`: browser-stored identity/password fallback paths | Isolate demo authentication in a nonproduction environment; use vetted identity/password hashing and server session lifecycle. Browser identity edits cannot authorize API access; old passwords fail after reset; default accounts cannot authenticate in production |
| P0 | `supabase-schema.sql`: tenant `FOR ALL` policies for students, teachers, classes and fees compare only institute IDs | Extend operation-specific role and object policies; same-campus membership alone must not grant write/read access to all students. Test real database identities for teacher class membership, student self, guardian link, admin and superadmin |
| P0 | `ParentPortalView.jsx`: `useState(INITIAL_CHILDREN)`; `StudentPortalView.jsx`: payment success alert | Replace demo financial data with authorized shared invoices/payment state machine. Browser success cannot settle a payment; duplicate provider events create one posting; pending/failed payments never render paid receipts |
| P1 | `TeacherPortalView.jsx`: quick-create assignment uses `setAssignments`; parent chats/notifications use component state | All portals consume one scoped persisted service for assignments, communications and notification recipients; cross-browser acceptance required |
| P1 | `StudentPortalView.jsx`: password, leave and circular-download success alerts | Connect real mutations/downloads or explicitly label unavailable actions; success is shown only after authoritative acknowledgement |
| P1 | `PrintHelpers.jsx`: `QrCodeSvg` builds a hash-derived decorative matrix; bank presets include example account details | Use a standards-compliant QR encoder and opaque verification reference; independently scan at printed size. Replace example bank data with verified tenant configuration; block payment instructions until configured |
| P1 | `Modal.jsx`: Escape support exists, but no dialog semantics, focus trap/restore or accessible close name; hard-coded white surfaces | Implement accessible shared dialog with inert background, focus containment, initial focus, Escape, return focus and theme tokens; run keyboard/screen-reader checks |
| P1 | `src/index.css`: light/dark tokens already exist; portal markup includes hard-coded colors; manifest theme differs from primary token | Extend existing tokens instead of adding a competing production palette. Audit text-on-brand in both modes; replace hard-coded surfaces and normalize brand configuration |
| P1 | `supabase-schema.sql` has `user_profiles`; authentication queries `users`; checked-in schema lacks guardian links, assignments, submissions and payment-event tables | Reconcile actual deployment schema with versioned migrations and API contracts. Clean installation plus upgrade test must pass; do not assume deployed schema equals this file |
| P2 | `public` contains favicon/manifest and Vite asset; no service-worker registration found in `src`/`public` | Icons and dashboards are present, not universally missing. Add approved brand pack and install icons; remove unused starter asset only after reference check. Specify offline behavior before advertising offline support |

## 3. Canonical capability ownership

| Capability (required somewhere) | Authoritative write owner | Other portal access |
|---|---|---|
| Tenants, subscriptions, entitlements | Superadmin | Admin reads own plan; landing reads published plan catalog |
| Enrollment, terms, classes, guardian links | Institute admin | Teacher assigned roster; student self; guardian linked children |
| Attendance | Assigned teacher/admin with correction permission | Student/parent read own/linked records; leave is a separate request |
| Assignments and submissions | Teacher authors; student submits | Admin oversight; parent read-only child progress |
| Marks and report cards | Teacher drafts; authorized publisher approves | Student/parent only published version |
| Student invoices and payments | Institute billing role; trusted payment processor | Student/guardian authorized read/initiation; never direct settlement |
| Notices and conversations | Authorized staff/authenticated participants | Audience-filtered delivery and per-recipient read state |
| Audit, recovery, notification delivery | Server/platform services | Admin tenant-scoped audit; superadmin audited operational access |

Common mandatory capabilities in every authenticated portal: accessible navigation, session expiry/logout, account recovery, scoped search where offered, loading/empty/error/denied states, help, locale/timezone handling. Landing must never expose private records. Offline writes, payment gateways, transport, library and payroll are optional unless contractually enabled.

## 4. Unified design system brief

- **Shell:** common brand placement, page title, breadcrumbs for nested screens, role/tenant identity, notifications, help and account menu. Parent shell adds persistent child context. Use a compact app footer for support/privacy/version and a fuller public footer; identical footer content is unnecessary.
- **Navigation:** group by tasks: Overview, People, Learning, Attendance, Fees, Communication, Reports, Settings. Render only authorized groups. One route registry drives menu, breadcrumbs, permissions and deep links. Back/forward and refresh preserve route and selected authorized child.
- **Terms:** user-facing School (technical tenant/institute ID), Campus for a branch, Academic year, Class, Section, Guardian, Invoice, Payment and Receipt. A challan is an unpaid payment instruction; a receipt confirms a posted payment. Rename Defaulter to Outstanding balance. Define platform subscription invoices separately.
- **Tokens:** surface `#FFFFFF`, canvas `#F8FAFC`, text `#0F172A`, muted text `#475569`, control border `#64748B`, primary `#4338CA`, primary hover `#3730A3`, danger `#B91C1C`, success text `#166534`. Dark surface `#111827`, text `#F8FAFC`, primary `#A5B4FC` with dark on-primary `#111827`. Status always includes text/icon.
- **Type and geometry:** one system-font family (optional licensed locally hosted brand font); body 16px/1.5; supporting text 14px minimum by design; headings 20/24/32px; spacing 4/8/12/16/24/32px; controls 44px minimum product target; radii 8px controls/12px panels; tabular numerals for amounts.
- **Components:** Button, IconButton, labeled Field, Select, Checkbox, Dialog, Drawer, DataTable, Pagination, StatusBadge, Alert, Toast, EmptyState, ChildSwitcher and DocumentHeader. Shared patterns for filters, bulk actions, destructive confirmation, optimistic rollback, unsaved changes and print documents.
- **Responsive:** at 320px use one column and a keyboard-operable navigation drawer; at 768px allow two-column content; at 1024px use persistent sidebar. Tables can scroll within a labeled region, not the entire page. At 200% zoom and 400% reflow, actions and content remain available. Sticky UI must not obscure focus.
- **Accessibility:** target WCAG 2.2 AA. Normal text contrast >=4.5:1, large text >=3:1, required control boundaries/states >=3:1. Use native controls, persistent labels, `aria-describedby` for help/errors, `aria-invalid` for invalid fields, `aria-current="page"` for current navigation and `aria-expanded` on disclosures. Use `role="status"` for nonurgent save feedback; errors receive focus/announcement without repetitive alerts. Decorative icons are hidden from assistive technology. Dialogs need focus containment/restore; Escape closes dismissible dialogs. Respect reduced motion and forced colors. Product target is 44px controls; WCAG AA target-size minimum is 24px subject to exceptions.

Normative reference: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/). Conformance requires manual as well as automated testing; these snippets do not establish conformance.

Framework hints: implement these contracts as React/Angular/Vue components or Laravel/Blade/Inertia partials; preserve native HTML semantics and identical authorization rules in the server. No framework migration is required.

## 5. Assets and data-model additions

All tenant-owned records carry `tenant_id`, immutable `id`, timestamps and appropriate foreign keys. Enforce tenant-consistent relationships in the database, not only application filters. Store amounts as integer minor units with currency; store event timestamps in UTC and display school timezone. IDs are opaque; date-only school dates remain date-only.

| Addition / consolidation | Minimal model | Required invariant |
|---|---|---|
| Role access and child relationships | Membership(user_id, tenant_id, role, status); ClassTeacher(class_id, teacher_id, subject_id); GuardianLink(guardian_id, student_id, relationship, permissions, verified_at, revoked_at) | Role and relationship validated per request; revocation effective on next request; no arbitrary client tenant overrides |
| Shared academic records | Enrollment(student_id, class_id, section_id, academic_year_id, status); Attendance(student_id, session_id, status, version, recorded_by); LeaveRequest(student_id, requested_by, dates, reason, state, approver_id) | Unique attendance per student/session; concurrent edit version conflicts are explicit; leave approval does not silently rewrite attendance |
| Learning and assessment | Assignment(class_id, subject_id, author_id, due_at, state); Submission(assignment_id, student_id, attempt, attachment_id, submitted_at); Result(student_id, exam_id, marks, state, version, published_at) | Assigned-class access; scanned authorized attachments; drafts hidden; teacher cannot silently overwrite published results |
| School finance | Invoice(student_id, number, currency, total_minor, state); InvoiceLine(invoice_id, description, amount_minor); Payment(provider_reference, idempotency_key, amount_minor, state); Allocation(payment_id, invoice_id, amount_minor); Refund(payment_id, amount_minor, state); Receipt(payment_id, number, issued_at, template_version, snapshot) | Unique provider event; allocation totals cannot exceed settled payment; refunds linked, never destructive edits; receipt captures immutable issued values |
| Notices and delivery | Notice(author_id, audience, published_at); Notification(recipient_id, event_id, read_at); Delivery(notification_id, channel, state, attempts, delivered_at); Conversation(participant_ids); Message(conversation_id, sender_id, body, sent_at) | One notification per recipient/event; authorized recipients only; retries do not duplicate messages; read state persists per user |
| Audit and support access | AuditEvent(actor_id, effective_actor_id, tenant_id, action, entity_id, redacted_diff, request_id, occurred_at); SupportAccess(reason, tenant_id, approver_id, expires_at) | Append-only server events; no credentials/full sensitive payloads; support access time-bound and attributable |
| Branding and documents | BrandAsset(tenant_id, kind, storage_key, mime, version, approved_at); DocumentTemplate(kind, version, locale, paper_size, brand_version) | Approved logo/wordmark, favicon, 192/512 icons and print monochrome variant; template version retained on issued documents |
| Optional offline | Outbox(user_id, tenant_id, device_id, operation_id, base_version, payload, state); SyncCursor(scope, cursor, synced_at) | Initially allow attendance drafts only; explicit stale/sync/conflict UI; no offline settlement; purge private cache on logout; reject stale revoked authorization on sync |

Also add versioned migrations, role/tenant fixture data, API contract documentation, smoke automation and independent QR scan tests. Dashboards, icons, audit views and notification views already exist; durable backing, consistency and acceptance evidence are the gaps.

## 6. Button and slip implementation assets

Use `reference.css` for framework-independent token/button/form/print examples. `slip-templates.html` demonstrates an unpaid invoice/challan and a separate paid receipt with clearly fictional sample values. These files are reference assets, not wired into the app.

Buttons: `.sms-button` with `.sms-button--primary`, `.sms-button--secondary` or `.sms-button--danger`; one primary action per action group. Use `type="button"` for non-submit actions. Use native `disabled` for unavailable controls, plus an adjacent reason when needed. Pending actions retain a descriptive label and block duplicate submissions. CSS alone cannot implement loading or authorization.

Documents: A4/Letter, 15mm page margins, centered maximum 180mm slip, 11pt body, 16pt title, monochrome-readable borders and repeating table headers. Each document starts a new page; long line-item tables may continue without clipping. Suppress app navigation and modal backdrops. Use a dedicated print route/document, not visibility hacks on a large portal tree. Optional printer/browser headers are controlled in the print dialog.

Receipt fields: school identity/contact, receipt number, posted timestamp/timezone, student/reference, source invoice, currency, amount received, allocations, balance, payment method, masked transaction reference, issuer, verification reference and template version. Challan fields: invoice number, due date, itemization, concessions/tax where configured, total due and verified payment instructions; explicitly state it is not proof of payment. Never invent live bank details or verification codes.

Print acceptance: A4 and Letter at 100%, backgrounds disabled and grayscale; no clipped amount/identity, no blank leading page, no UI chrome, all text legible. Exercise 1 and 50 line items and long names. Barcode/QR must scan to the correct authorized verification response; public verification reveals minimal information. Browser print preview and physical scan are still required for these reference assets.

## 7. Delivery sequence and QA runbook

1. **P0 / platform and backend:** close private endpoint access, remove production auth fallbacks, implement relationship policies and authoritative payment processing. Gate: negative authorization suite and payment replay suite pass.
2. **P1 / domain teams:** connect parent/student/teacher workflows to canonical records; reconcile schema and migrations; remove false successes. Gate: independent-session academic and financial journeys pass.
3. **P1 / design and frontend:** adopt shell/terms/tokens, accessible dialogs/forms, real document encoding and print templates. Gate: responsive, keyboard, contrast and print checks pass.
4. **P2 / product:** enable optional modules per tenant; add offline drafts only with explicit conflict policy. Gate: enabled-module tests pass and disabled modules expose no active routes/API capabilities.

Test fixtures: two tenants; each with admin, two teachers assigned to different classes, two unrelated students, two unrelated guardians, and one guardian legitimately linked to two children. Use isolated browser sessions/devices; seed only fictional data. Payment provider must be sandboxed.

| Check | Procedure | Pass condition |
|---|---|---|
| Build and routes | Clean install/build; open all six portals; traverse navigation; refresh nested route; use Back | No build/runtime error or unexpected role fallback; intended route/context retained |
| Landing conversion | Submit invalid then valid inquiry, repeat network request | Errors associated with fields; one durable inquiry; superadmin sees matching content |
| Access matrix | Alter URL/body IDs, tenant and child IDs; request private endpoints anonymously; revoke guardian link | 401/403 or nonrevealing 404 as specified; no foreign record returned/changed; revocation enforced on next request |
| Attendance | Teacher records attendance; admin corrects with reason; student/parent refresh separate sessions | One record, identical state, full correction audit; unrelated teacher denied |
| Assignment | Teacher publishes; student uploads; teacher grades; guardian reads progress | Shared durable IDs; state survives re-login; draft/unrelated records hidden |
| Results | Save draft, publish, revise via authorized workflow | Draft hidden to family; publication visible; revisions versioned and auditable |
| Payments | Create invoice, initiate payment, fail/cancel, settle, replay event, partial-pay, refund | No premature receipt; one ledger posting per event; exact balances in three portals; refunds preserve original history |
| Communications | Publish class notice; send permitted message; read from another device | Correct audience only; unread counts agree after refresh; delivery failures shown truthfully |
| Session/account | Reset password, revoke session, logout, switch account in same browser | Old access rejected; no previous child's data/profile remains in UI/cache |
| Accessibility | Keyboard-only complete tasks; screen-reader dialog/form checks; light/dark contrast measurement | No trap or unlabeled action; focus restored; errors announced; stated contrast targets met |
| Responsive | 320/768/1280px; 200% zoom; 400% reflow; long localized labels | No lost actions or page-level overflow except legitimate data regions; visible focus |
| Print | Invoice and receipt; A4/Letter; grayscale; 1/50 items; scan encoded reference | Correct document semantics, totals and page layout; independently readable encoding |
| Recovery/offline | Disconnect/reconnect during save; restore backup in isolated environment | Explicit pending/error; no false success or duplicate mutation; restore matches snapshot; conflicts never silently overwrite |

Portfolio rollout: maintain a row for each system × portal × capability with owner, priority, status (absent/UI-only/persisted/cross-portal verified), evidence link, commit/environment, last verification date and exception expiry. Do not mark all 50 systems complete from this audit. Release only when all applicable Must-Haves are cross-portal verified; Nice-to-Haves can be absent if not promised or enabled.
