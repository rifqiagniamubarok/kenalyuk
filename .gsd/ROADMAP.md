# Roadmap: Kenalyuk! MVP

**Syariah-compliant matchmaking platform combining modern swipe UX with regional supervision**

## Overview

**Target**: 100 active users across 2-3 Indonesian cities to validate marriage-intention behaviors  
**Timeline**: 8 weeks (2-3 months total with testing)  
**Approach**: Feature-complete MVP focused on behavioral validation over premature scaling

---

## Phase 01 - Foundation & Approval System

**Duration**: Weeks 1-2  
**Status**: Complete ✅  
**Goal**: Complete user lifecycle from registration to supervisor approval

### Success Criteria

- Users can register, verify email, complete biodata, and upload photos ✅
- Supervisors can approve/reject profiles with proper workflows ✅
- Role-based access control protects regional supervision boundaries ✅
- Profile re-approval triggers when users edit biodata/photos ✅
- 100% of test users successfully navigate registration → approval flow ✅

### Requirements Coverage

- **AUTH-01 to AUTH-07**: Complete authentication and onboarding system (7 requirements) ✅
- **SUP-01 to SUP-06**: Full supervision and approval workflows (6 requirements) ✅
- **ROLE-01 to ROLE-06**: Role management and administration system (6 requirements) ✅

**Total Requirements**: 19/25 (76% of v1 scope) - Complete

**Plans**: 6 plans - All complete

Plans:

- [x] 01-01-PLAN.md — Project Setup & Database Foundation
- [x] 01-02-PLAN.md — Authentication Foundation & Role Schema
- [x] 01-03-PLAN.md — User Registration & Login System
- [x] 01-04-PLAN.md — Role Management & Administration
- [x] 01-05-PLAN.md — Biodata Forms & Photo Upload
- [x] 01-06-PLAN.md — Supervision Workflows & Approvals

---

## Phase 02 - Discovery & Matching Core

**Duration**: Weeks 3-5  
**Status**: Complete ✅  
**Goal**: Active users can discover and create matches through swipe interface

### Success Criteria

- Discovery feed shows relevant profiles based on preferences and filters
- Swipe interface (like/pass) works smoothly on mobile and desktop
- Mutual likes automatically create matches with immediate chatroom access
- Users can view their matches and like history with proper state management
- ≥30% match rate achieved among active test users

### Requirements Coverage

- **DISC-01 to DISC-06**: Complete discovery and matching system (6 requirements)

**Total Requirements**: 6/25 (24% of v1 scope)

**Plans**: 4 plans

Plans:

- [x] 02-01-PLAN.md — Database schema for discovery & matching (Like, Pass, Match models + preferences)
- [x] 02-02-PLAN.md — Discovery feed system with filtering and swipe interface
- [x] 02-03-PLAN.md — Like/pass actions with automatic match creation
- [x] 02-04-PLAN.md — Matches and likes history views

---

## Phase 03 - Communication & Moderation

**Duration**: Weeks 6-8  
**Status**: Complete ✅  
**Goal**: Supervised real-time chat enabling meaningful marriage-intention conversations

### Success Criteria

- Matched users can send real-time messages with proper conversation history ✅
- Supervisors can monitor all conversations in their assigned regions ✅
- Cross-region matches are visible to supervisors from both regions ✅
- Typing indicators and real-time updates work reliably ✅
- ≥50% of matches convert to meaningful conversations (≥10 messages exchanged)

### Requirements Coverage

- **CHAT-01 to CHAT-06**: Complete moderated chat system (6 requirements) ✅

**Total Requirements**: 6/25 (24% of v1 scope) - Complete

**Plans**: 4 plans - All complete

Plans:

- [x] 03-01-PLAN.md — Database schema for chat (Message model)
- [x] 03-02-PLAN.md — Message APIs (send, receive, real-time SSE)
- [x] 03-03-PLAN.md — User chat interface with real-time messaging
- [x] 03-04-PLAN.md — Supervisor conversation monitoring and closure

---

## Phase 04 - User Interface Redesign & Simplification

**Duration**: Week 9  
**Status**: Complete ✅  
**Goal**: Streamline user interface for better usability and efficiency

### Success Criteria

- Simplified navigation with only 3 main menus: Profile, Discovery, Chat
- Profile consolidates Dashboard, Biodata, and Photos into single unified view
- Photo ordering system allows users to customize photo display order
- First photo automatically becomes profile picture across the platform
- Reduced form validation requirements for better user experience
- Progressive disclosure: unapproved users see only Profile menu

### Requirements Coverage

- **UI-01**: Consolidated profile page with dashboard, biodata, and photos
- **UI-02**: Simplified navigation structure (Profile, Discovery, Chat only)
- **UI-03**: Photo ordering system with drag-and-drop reordering
- **UI-04**: Profile picture auto-assignment from first photo
- **UI-05**: Reduced biodata validation (About Me: 5+ chars, Looking For: optional)
- **UI-06**: Remove Likes menu from navigation
- **UI-07**: Replace emoji icons with Lucide icons throughout
- **UI-08**: Conditional navigation based on approval status

**Total Requirements**: 8 new requirements

**Plans**: 3 plans

Plans:

- [x] 04-01-PLAN.md — Navigation Simplification & Icon System
- [x] 04-02-PLAN.md — Photo Ordering System
- [x] 04-03-PLAN.md — Consolidated Profile Page & Validation Updates

**Details:**

**Navigation Changes:**

- Simplify from 6 menu items to 3 core actions: Profile, Discovery, Chat
- Remove standalone Dashboard, Biodata, Photos, Likes pages
- Consolidate all profile management into single Profile view

**Profile Consolidation:**

- Single page contains: completion status, biodata form, photo management
- Vertical layout for mobile-first design
- Progressive sections: Status → Basic Info → Photos → About
- Real-time validation feedback

**Photo Management:**

- Drag-and-drop reordering interface
- First photo displays as profile picture everywhere
- Visual preview of how profile appears to others
- Upload/edit/reorder in single unified interface

**Form Simplification:**

- About Me: Minimum 5 characters (reduced from 50)
- What I'm Looking For: Optional field (removed required validation)
- Keep all other required fields unchanged

**Icon System:**

- Replace all emoji icons with Lucide React icons
- Consistent icon sizing and styling
- Better accessibility and visual harmony

**Conditional UI:**

- Unapproved users: Only Profile menu visible
- Approved users: All 3 menus accessible
- Clear messaging about approval status

### Phase 5: Adjust send email SMTP .env configuration, add forgot password and verify password for register, send email notification after supervisor approval, and add function to read HTML format

**Goal:** Deliver reliable HTML-based transactional emails and complete password recovery flow (forgot/reset) with strong register password verification
**Depends on:** Phase 4
**Plans:** 3 plans

Plans:

- [x] 05-01-PLAN.md — SMTP normalization + HTML email template reader + approval notification wiring
- [x] 05-02-PLAN.md — Forgot/reset password backend (token model, APIs, reset email template)
- [ ] 05-03-PLAN.md — Auth UI integration (forgot/reset pages) + register password verification + human verification

**Details:**

- Centralize SMTP handling to avoid env key mismatches and delivery failures
- Move transactional email body source to HTML template files
- Add secure forgot-password and reset-password token flow
- Keep registration password confirmation enforced on both client and API
- Preserve supervisor approval notification after user acceptance

### Phase 6: Add like chip notif in chat tab with unread count per chat bubble, simplify chat page display, and include new match chip notifications

**Goal:** Add unread/new-match chat notification chips and simplified chat inbox UI with conversation-level unread visibility
**Depends on:** Phase 5
**Plans:** 3 plans

Plans:

- [x] 06-01-PLAN.md — Backend unread/new-match metadata + read-state update flow
- [x] 06-02-PLAN.md — Simplified /chat inbox UI (photo, name, last chat, unread/new chips)
- [x] 06-03-PLAN.md — Chat tab aggregate chip (Chat N) + human verification

**Details:**

- Count unread messages per conversation and mark incoming messages as read when chat room opens
- Show per-conversation unread chip and new-match indicator in simple chat list
- Display aggregate chat tab chip including unread messages + new matches without messages

### Phase 7: Adjust profile page: first view displays large profile picture with clickable smaller photo navigation, max 5 photos, read-only biodata text, and edit picture/biodata modals in a simpler tidy UX

**Status:** Complete ✅
**Goal:** Deliver a simpler photo-first profile page with read-only biodata display, modal-based editing, and strict 5-photo maximum
**Depends on:** Phase 6
**Plans:** 3 plans

Plans:

- [x] 07-01-PLAN.md — Simplified profile first view (large photo + thumbnail navigation + read-only biodata shell)
- [x] 07-02-PLAN.md — Modal edit actions for picture and biodata with refresh back to read-only view
- [x] 07-03-PLAN.md — Enforce strict max-5 photos across UI/API + human verification

**Details:**

- First screen prioritizes profile picture and thumbnail navigation interactions
- Biodata is text-only in first view for cleaner profile readability
- Edit actions are moved into modals (`Edit Picture`, `Edit Biodata`)
- Photo limit is standardized to max 5 across UI and backend rules

### Phase 8: in discovery page, remove arrow function for pass and like, add tooltip in icon pass and like, hide available user count, simplify card layout with main picture then name/about plus details modal, move like/pass buttons below card, and add card swipe animation (like right, pass left)

**Goal:** Simplify discovery interactions and card layout with tooltip actions, hidden availability count, modal detail flow, and directional swipe animation feedback
**Depends on:** Phase 7
**Plans:** 3 plans

Plans:

- [x] 08-01-PLAN.md — Remove arrow-key/count indicators + move pass/like to tooltip icon controls below card
- [x] 08-02-PLAN.md — Simplify card surface and add ordered detail modal for full biodata/photos
- [ ] 08-03-PLAN.md — Add pass-left/like-right card animation + human verification

**Details:**

- Discovery no longer exposes candidate availability counts
- Pass/Like no longer rely on keyboard arrow shortcuts
- Card surface is simplified to main photo + name + about + detail trigger
- Full biodata and additional photos move to dedicated modal
- Action controls remain below card and card transitions animate directionally (right on like, left on pass)

### Phase 9: adjust navbar. remove profile button in right side and move signout button in the bottom of profile page. make navbar not fully screen wide, use card-like island style. layout is app title (kenlay yuk), profile logo-only button, discovery logo-only button, and chat logo-only button. keep it simple and elegant

**Goal:** Deliver a compact island-style navbar with title + icon-only Profile/Discovery/Chat and relocate signout to a dedicated bottom section on Profile page
**Depends on:** Phase 8
**Plans:** 3 plans

Plans:

- [x] 09-01-PLAN.md — Compact island navbar with title and icon-only Profile/Discovery/Chat, remove right-side profile dropdown
- [x] 09-02-PLAN.md — Remove navbar logout and move signout to bottom section of profile page
- [x] 09-03-PLAN.md — Final responsive polish and human verification for navbar + signout relocation

**Details:**

- Navbar becomes compact/card-like island (not full-width edge-to-edge)
- Navigation remains simple: app title + icon-only Profile, Discovery, Chat
- Right-side profile/avatar dropdown is removed
- Signout is available only at profile page bottom
- Final phase includes explicit human verification checkpoint for visual/functional confirmation

---

## Validation Targets

### Behavioral Metrics

- **User Retention**: ≥60% weekly active users
- **Match Success**: ≥30% of users achieve mutual matches
- **Chat Conversion**: ≥50% of matches start meaningful conversations
- **Marriage Intent**: 2-3 users progress to family introduction stage

### Technical Metrics

- **Performance**: <2s page load times on mid-range Android devices
- **Reliability**: 99% message delivery rate in real-time chat
- **Security**: Zero unauthorized access to role-restricted features
- **Scale Readiness**: System handles 100 concurrent users without degradation

---

## Risk Mitigation

**Technical**: Single Next.js monolith with PostgreSQL minimizes complexity  
**Market**: Early behavioral validation with small user group before scaling  
**Resources**: YOLO execution mode with AI assistance for rapid development  
**Timeline**: 8-week phased approach allows course correction between phases

---

## Success Definition

**MVP Success**: Platform demonstrates that regional supervision + modern UX creates higher marriage-intention engagement than existing dating apps, validated through measurable user behavior patterns.

## Next Steps

1. **Phase 01 Planning**: Break down authentication and approval system into executable tasks
2. **Technical Setup**: Initialize Next.js project with Auth.js, PostgreSQL, and Prisma
3. **Regional Configuration**: Define initial test regions (Jakarta, Bandung, Yogyakarta)
4. **Supervisor Recruitment**: Identify 2-3 trusted supervisors for initial regions
