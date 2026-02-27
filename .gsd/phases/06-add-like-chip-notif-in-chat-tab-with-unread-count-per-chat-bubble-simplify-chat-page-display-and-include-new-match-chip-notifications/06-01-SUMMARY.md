---
phase: 06-add-like-chip-notif-in-chat-tab-with-unread-count-per-chat-bubble-simplify-chat-page-display-and-include-new-match-chip-notifications
plan: 01
subsystem:
  - api
  - chat
  - ui
tags: [matches-api, unread-count, read-state, prisma, usechat]
requires:
  - phase: 03-communication-moderation
    provides: message persistence APIs and chat hook foundation
provides:
  - Match list API now returns unread counters per conversation
  - Match list API surfaces new-match signal and last-message summary
  - Message history GET marks incoming unread messages as read on chat open
affects: [06-02-chat-inbox-ui, 06-03-chat-tab-aggregate-chip, chat-notification-ux]
tech-stack:
  added: []
  patterns:
    - Compute unread counts server-side scoped to authenticated active user
    - Apply read-state transition when conversation history is opened
key-files:
  created: []
  modified:
    - src/app/api/matches/route.ts
    - src/app/api/messages/[matchId]/route.ts
    - src/lib/useChat.ts
key-decisions:
  - Keep existing `/api/matches` fields while appending new notification metadata for backward compatibility.
  - Mark messages as read after participant validation and before returning history to align unread counts with user open-chat behavior.
patterns-established:
  - Chat notification metadata should be derived on the backend (`unreadCount`, `hasNoMessages`, `lastMessage`) instead of inferred in UI.
  - Chat history consumers should tolerate additive API metadata without breaking rendering.
duration: 22min
completed: 2026-02-28
---

# Phase 06 Plan 01: Backend unread/new-match metadata + read-state update flow Summary

**Chat backend now exposes per-conversation unread/new-match notification metadata and updates incoming message read-state when users open a chat room.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-02-28T10:20:00Z
- **Completed:** 2026-02-28T10:42:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Extended `GET /api/matches` response with `unreadCount`, `hasNoMessages`, and `lastMessage` while preserving current match card fields.
- Ensured unread counting excludes messages sent by current user and stays scoped to authenticated ACTIVE user matches.
- Updated `GET /api/messages/[matchId]` to mark unread incoming messages as read before returning message history.
- Hardened `useChat` history parsing to remain stable with additive response metadata.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend matches API with unread counters and new-match signal** - `3f6c9ed` (feat)
2. **Task 2: Mark messages as read when opening chat room** - `f0d2030` (feat)

## Files Created/Modified

- `src/app/api/matches/route.ts` - Added unread aggregation, message-presence signal, and last-message summary in matches payload.
- `src/app/api/messages/[matchId]/route.ts` - Added `updateMany` read-state transition for incoming unread messages.
- `src/lib/useChat.ts` - Added resilient response parsing for history payload.

## Decisions Made

- Keep response augmentation additive to avoid breaking existing consumers during phased rollout.
- Place read-state update in history GET to guarantee transition when chat room is opened.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `next lint` in this workspace does not support `--file` and direct `eslint` invocation requires flat config (`eslint.config.*`); used TypeScript check as focused validation for touched files.

## User Setup Required

None.

## Next Phase Readiness

- Backend contract for chat notification chips is ready for Plan 06-02 UI inbox simplification.
- No blockers identified for proceeding to 06-02.

---

_Phase: 06-add-like-chip-notif-in-chat-tab-with-unread-count-per-chat-bubble-simplify-chat-page-display-and-include-new-match-chip-notifications_
_Completed: 2026-02-28_
