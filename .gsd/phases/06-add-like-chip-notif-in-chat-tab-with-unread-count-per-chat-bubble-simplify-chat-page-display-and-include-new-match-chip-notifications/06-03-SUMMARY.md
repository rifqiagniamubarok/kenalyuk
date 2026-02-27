---
phase: 06-add-like-chip-notif-in-chat-tab-with-unread-count-per-chat-bubble-simplify-chat-page-display-and-include-new-match-chip-notifications
plan: 03
subsystem:
  - ui
  - chat
  - api
tags: [chat-tab-chip, unread-count, new-match-indicator, navigation-badge, matches-summary]
requires:
  - phase: 06-02
    provides: simplified chat inbox rows with unread/new indicators
provides:
  - User navigation chat tab now supports aggregate badge count for unread + new-match state
  - Matches API now exposes aggregate summary fields for chat-tab-compatible totals
  - Badge and chat row chips update without manual refresh via silent polling
affects: [chat-navigation-flow, unread-visibility, phase-06-verification]
tech-stack:
  added: []
  patterns:
    - Aggregate chat notification count = total unread incoming messages + total matches with zero messages
    - Navigation menu item contract supports optional `badgeCount` to keep non-chat tabs unchanged
key-files:
  created: []
  modified:
    - src/app/(user)/layout.tsx
    - src/components/Navigation.tsx
    - src/app/(user)/chat/page.tsx
    - src/app/api/matches/route.ts
key-decisions:
  - Keep server-side initial badge computation, then refresh client-side via silent polling for no-refresh updates.
  - Extend `/api/matches` with a backward-compatible `summary` object instead of replacing existing fields.
patterns-established:
  - Navigation-level notification surfaces use existing unread/new-match semantics from chat domain.
  - Badge presentation stays minimal and only renders when count > 0.
  - Silent polling freezes displayed counts on fetch failure (no reconnect banner/toast).
duration: 28min
completed: 2026-02-28
---

# Phase 06 Plan 03: Chat tab aggregate chip Summary

**Plan complete: chat navigation aggregate chip and chat inbox unread/new chips now update without manual refresh, and human verification was approved.**

## Performance

- **Duration:** 28 min
- **Started:** 2026-02-28T12:05:00Z
- **Completed:** 2026-02-28T12:49:00Z
- **Tasks:** 2/2 complete
- **Files modified:** 4

## Accomplishments

- Added optional navigation item badge support and rendered it in both desktop and mobile menu rows.
- Computed chat badge total in user layout as `sum(unreadCount) + count(matches with hasNoMessages=true)`.
- Extended `/api/matches` response with `summary.totalUnreadCount`, `summary.newMatchesWithoutMessages`, and `summary.chatTabCount` while preserving `matches` payload.
- Added no-refresh updates: chat navigation badge and `/chat` row chips now refresh automatically with slight-delay polling.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add chat tab aggregate chip count to user navigation** - `a42a513` (feat)
2. **Follow-up fix: Enable no-refresh chip updates** - `7ec4a26` (feat)

## Files Created/Modified

- `src/app/(user)/layout.tsx` - Added server-side aggregate computation and chat `badgeCount` menu injection.
- `src/components/Navigation.tsx` - Added optional `badgeCount` model and silent polling refresh for live chat badge updates.
- `src/app/(user)/chat/page.tsx` - Added silent polling/visibility refresh so unread/new chips update without manual reload.
- `src/app/api/matches/route.ts` - Added aggregate `summary` block for unread/new-match totals.

## Decisions Made

- Kept implementation minimal and scoped to plan requirements (no new pages, filters, or non-chat badge behavior).
- Reused current database relations and existing message-read semantics instead of introducing new tables or background jobs.

## Deviations from Plan

- Added a focused follow-up fix to satisfy no-refresh real-time behavior for badge/chip updates.

## Issues Encountered

- `next lint --file` is unsupported in this Next.js CLI version, so focused validation used TypeScript compile check instead.

## Validation

- ✅ `npx tsc --noEmit`
- ⚠ `npm run lint -- --file ...` failed due unsupported `--file` option in this repo's lint command

## Human Verification

- ✅ User approved checkpoint verification for row chips, chat-tab chip behavior, and count changes after read actions.

## Next Phase Readiness

- Plan metadata is ready for docs commit and phase-level completion updates.

---

_Phase: 06-add-like-chip-notif-in-chat-tab-with-unread-count-per-chat-bubble-simplify-chat-page-display-and-include-new-match-chip-notifications_
_Completed: 2026-02-28_
