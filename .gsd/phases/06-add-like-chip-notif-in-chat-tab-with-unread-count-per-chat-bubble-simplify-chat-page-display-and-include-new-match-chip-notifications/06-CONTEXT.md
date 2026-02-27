# Phase 6: Add like chip notif in chat tab with unread count per chat bubble, simplify chat page display, and include new match chip notifications - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver real-time chat notification chips and simplified chat inbox display within existing chat capability. This phase covers unread/new-match indicators on chat rows and aggregate chat-tab count behavior, without adding new chat features beyond notification/display behavior.

</domain>

<decisions>
## Implementation Decisions

### Real-time update behavior

- Slight delay is acceptable (does not need strict instant/sub-second guarantees).
- Updates must apply to both inbox row chips and navigation Chat aggregate chip.
- If connection is interrupted, chip values should freeze silently (no reconnect banner/toast required).
- Incoming messages from other users should update notification chips even when user is on non-chat pages.

### Copilot's Discretion

- Exact timing mechanism and transport for live updates.
- Counting edge-case handling details (simultaneous updates/race order), as long as user-visible totals remain consistent.
- Chip visual style details (shape, color token usage, max-number formatting) within existing design system.
- Exact read-state trigger implementation detail, provided behavior matches phase requirements and existing chat flow.

</decisions>

<specifics>
## Specific Ideas

- Primary expectation: users should not need manual refresh to see chat notification count changes.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 06-add-like-chip-notif-in-chat-tab-with-unread-count-per-chat-bubble-simplify-chat-page-display-and-include-new-match-chip-notifications_
_Context gathered: 2026-02-28_
