# Roadmap: Kenalyuk! MVP

**Syariah-compliant matchmaking platform combining modern swipe UX with regional supervision**

## Overview

**Target**: 100 active users across 2-3 Indonesian cities to validate marriage-intention behaviors  
**Timeline**: 8 weeks (2-3 months total with testing)  
**Approach**: Feature-complete MVP focused on behavioral validation over premature scaling

---

## Phase 01 - Foundation & Approval System

**Duration**: Weeks 1-2  
**Goal**: Complete user lifecycle from registration to supervisor approval

### Success Criteria

- Users can register, verify email, complete biodata, and upload photos
- Supervisors can approve/reject profiles with proper workflows
- Role-based access control protects regional supervision boundaries
- Profile re-approval triggers when users edit biodata/photos
- 100% of test users successfully navigate registration → approval flow

### Requirements Coverage

- **AUTH-01 to AUTH-07**: Complete authentication and onboarding system (7 requirements)
- **SUP-01 to SUP-06**: Full supervision and approval workflows (6 requirements)
- **ROLE-01 to ROLE-06**: Role management and administration system (6 requirements)

**Total Requirements**: 19/25 (76% of v1 scope)

**Plans**: 6 plans

Plans:

- [x] 01-01-PLAN.md — Project Setup & Database Foundation
- [ ] 01-02-PLAN.md — Authentication Foundation & Role Schema
- [ ] 01-03-PLAN.md — User Registration & Login System
- [ ] 01-04-PLAN.md — Role Management & Administration
- [ ] 01-05-PLAN.md — Biodata Forms & Photo Upload
- [ ] 01-06-PLAN.md — Supervision Workflows & Approvals

---

## Phase 02 - Discovery & Matching Core

**Duration**: Weeks 3-5  
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

---

## Phase 03 - Communication & Moderation

**Duration**: Weeks 6-8  
**Goal**: Supervised real-time chat enabling meaningful marriage-intention conversations

### Success Criteria

- Matched users can send real-time messages with proper conversation history
- Supervisors can monitor all conversations in their assigned regions
- Cross-region matches are visible to supervisors from both regions
- Typing indicators and real-time updates work reliably
- ≥50% of matches convert to meaningful conversations (≥10 messages exchanged)

### Requirements Coverage

- **CHAT-01 to CHAT-06**: Complete moderated chat system (6 requirements)

**Total Requirements**: 6/25 (24% of v1 scope)

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
