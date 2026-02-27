---
phase: 05-adjust-send-email-smtp-env-configuration-add-forgot-password-and-verify-password-for-register-send-email-notification-after-supervisor-approval-and-add-function-to-read-html-format
plan: 01
subsystem:
  - infra
  - notifications
tags: [smtp, nodemailer, email-templates, verification, supervisor]
requires:
  - phase: 01-foundation-approval-system
    provides: verification email flow and supervisor approval decision workflow
provides:
  - Central SMTP mailer factory with fallback env key support
  - File-based HTML template renderer with variable interpolation
  - Template-driven verification/approval/rejection email delivery with text fallback
affects: [05-02-forgot-reset-password-flow, 05-03-auth-ui-password-verification]
tech-stack:
  added: []
  patterns:
    - Centralized SMTP client via createMailerClient
    - HTML email rendering via renderEmailTemplate(templateName, variables)
key-files:
  created:
    - src/lib/mailer.ts
    - src/lib/email-template.ts
    - src/templates/emails/verification.html
    - src/templates/emails/approval.html
    - src/templates/emails/rejection.html
  modified:
    - src/lib/email.ts
    - src/lib/notifications.ts
    - .env
    - .gsd/ROADMAP.md
    - .gsd/STATE.md
key-decisions:
  - Kept backward-compatible SMTP fallbacks (SMTP_PASSWORD or SMTP_PASS, SMTP_FROM or SMPTP_FROM) while standardizing .env to SMTP_PASSWORD.
  - Preserved plain-text email bodies for deliverability while moving HTML source to template files.
patterns-established:
  - All transactional auth/supervision email HTML should come from src/templates/emails/*.html.
  - Mail-sending modules should rely on createMailerClient instead of local SMTP setup.
duration: 12min
completed: 2026-02-27
---

# Phase 05 Plan 01: SMTP + Template Email Foundation Summary

**Centralized SMTP configuration and file-based HTML email rendering now drive verification and supervisor decision notifications with preserved plain-text fallback bodies.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-27T16:00:00Z
- **Completed:** 2026-02-27T16:12:01Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Added shared SMTP client creation in `createMailerClient` with env fallback support to avoid key mismatch failures.
- Added shared `renderEmailTemplate` loader/interpolator for HTML templates from `src/templates/emails/`.
- Migrated verification, approval, and rejection email HTML from inline strings to dedicated template files while keeping `text` fallback.
- Preserved supervisor approval notification wiring in `src/app/api/supervisor/approve/route.ts` via `sendApprovalNotification(...)`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement shared SMTP client and HTML template reader** - `29b4a9e` (feat)
2. **Task 2: Migrate verification and supervisor decision emails to HTML template files** - `38ed6e5` (feat)

## Files Created/Modified

- `src/lib/mailer.ts` - Shared SMTP transporter creation and sender address resolution.
- `src/lib/email-template.ts` - Template file reader with `{{variable}}` interpolation.
- `src/lib/email.ts` - Verification email switched to `renderEmailTemplate('verification', ...)`.
- `src/lib/notifications.ts` - Approval/rejection notifications switched to template rendering.
- `src/templates/emails/verification.html` - Verification HTML source template.
- `src/templates/emails/approval.html` - Approval HTML source template (includes `{{userName}}`).
- `src/templates/emails/rejection.html` - Rejection HTML source template.
- `.env` - SMTP env normalized to `SMTP_PASSWORD` and valid `SMTP_FROM`.

## Decisions Made

- Keep SMTP fallback compatibility in code to prevent runtime breakage from legacy env naming.
- Centralize HTML email markup in files to remove inline duplication and simplify maintenance.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npm run build` still fails due pre-existing Next.js prerender/auth issues unrelated to this plan (`/login` suspense requirement and dynamic server usage on existing routes).

## User Setup Required

None - no external service configuration required beyond existing SMTP env setup.

## Next Phase Readiness

- Email infrastructure is ready for forgot/reset password token and reset email flow in Plan 05-02.
- No blockers from this plan.

---

_Phase: 05-adjust-send-email-smtp-env-configuration-add-forgot-password-and-verify-password-for-register-send-email-notification-after-supervisor-approval-and-add-function-to-read-html-format_
_Completed: 2026-02-27_
