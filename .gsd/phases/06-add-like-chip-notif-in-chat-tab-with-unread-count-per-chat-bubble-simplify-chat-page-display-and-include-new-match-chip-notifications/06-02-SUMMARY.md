---
phase: 06-add-like-chip-notif-in-chat-tab-with-unread-count-per-chat-bubble-simplify-chat-page-display-and-include-new-match-chip-notifications
plan: 02
subsystem:
  - ui
  - chat
tags: [chat-inbox, unread-chip, new-match-indicator, matches-flow, nextjs]
requires:
  - phase: 06-01
    provides: unread and new-match metadata from matches API
provides:
  - /chat now renders a simplified inbox list instead of redirecting to matches
  - Each chat row shows profile photo, display name, last chat preview, and unread/new indicators
  - Matches page chat entry messaging now aligns with inbox unread/new-match behavior
affects: [06-03-chat-tab-aggregate-chip, chat-navigation-flow, notification-ux]
tech-stack:
  added: []
  patterns:
    - Keep chat list UI minimal with server-derived metadata (`unreadCount`, `hasNoMessages`, `lastMessage`)
    - Use direct per-conversation routing to `/chat/[matchId]` from both inbox and matches list
key-files:
  created: []
  modified:
    - src/app/(user)/chat/page.tsx
    - src/app/(user)/matches/page.tsx
key-decisions:
  - Keep `/chat` as lightweight client-side inbox consuming existing `/api/matches` response contract.
  - Preserve matches cards while aligning chat copy to unread/new-match states instead of adding extra UI complexity.
patterns-established:
  - Conversation notifications are surfaced consistently in list-level entry points before room open.
  - New matches without messages use explicit fallback text and "New" indicator to prompt first message.
duration: 18min
completed: 2026-02-28
---

# Phase 06 Plan 02: Simplified /chat inbox UI (photo, name, last chat, unread/new chips) Summary

**The `/chat` route now works as a minimal inbox with per-conversation unread chips and new-match indicators, with matches-page chat messaging aligned to the same notification model.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-02-28T11:05:00Z
- **Completed:** 2026-02-28T11:23:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced `/chat` redirect behavior with a simple inbox list using `/api/matches` metadata.
- Added row-level unread chips (only when `unreadCount > 0`) and explicit `New` chip when `hasNoMessages` is true.
- Displayed the required fallback preview text: `New match - start chatting` when conversation has no messages.
- Kept per-conversation click-through behavior to `/chat/[matchId]`.
- Updated matches-page chat messaging and CTA copy to align with inbox-first unread/new-match flow.

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace chat entry redirect with simplified chat inbox page** - `de42610` (feat)
2. **Task 2: Align matches page linking/wording with inbox-first chat flow** - `23d8955` (feat)

## Files Created/Modified

- `src/app/(user)/chat/page.tsx` - Implemented simplified inbox UI with profile photo, name, last chat text, unread chip, and new-match indicator.
- `src/app/(user)/matches/page.tsx` - Aligned chat CTA copy and state messaging with unread/new-match semantics while keeping `/chat/[matchId]` routing.

## Decisions Made

- Keep implementation strictly minimal to match requested UX: no extra filters, grouping, or secondary actions on `/chat`.
- Reuse existing `/api/matches` metadata directly in UI rather than duplicating unread/new-match inference client-side.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- Inbox-level conversation visibility is ready for Plan 06-03 aggregate chat-tab chip implementation.
- No blockers identified for proceeding to 06-03.

---

_Phase: 06-add-like-chip-notif-in-chat-tab-with-unread-count-per-chat-bubble-simplify-chat-page-display-and-include-new-match-chip-notifications_
_Completed: 2026-02-28_
