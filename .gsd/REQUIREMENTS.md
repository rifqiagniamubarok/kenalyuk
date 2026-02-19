# Requirements Specification

## v1 Requirements

### Authentication & Onboarding
- [ ] **AUTH-01**: User can register with email/password using Auth.js
- [ ] **AUTH-02**: User can verify email address before account activation
- [ ] **AUTH-03**: User can log in and maintain session across browser restarts
- [ ] **AUTH-04**: User can complete biodata form (name, gender, date of birth, height, city, region, education, occupation, religion level, about me, looking for preferences)
- [ ] **AUTH-05**: User can upload 5-9 photos with client-side compression and preview
- [ ] **AUTH-06**: User status becomes PENDING_APPROVAL automatically after biodata completion
- [ ] **AUTH-07**: User can log out from any page

### Supervision & Approval
- [ ] **SUP-01**: Supervisor can view list of pending users in their assigned region
- [ ] **SUP-02**: Supervisor can approve user profiles to change status to ACTIVE
- [ ] **SUP-03**: Supervisor can reject user profiles with required reason text
- [ ] **SUP-04**: User receives notification of approval/rejection status change
- [ ] **SUP-05**: Re-approval workflow triggers when user edits biodata or photos
- [ ] **SUP-06**: Supervisor can view approval history and previous decisions

### Discovery & Matching  
- [ ] **DISC-01**: Active users can view discovery feed filtered by gender, region preference, and age range
- [ ] **DISC-02**: User can like/pass on profiles using swipe interface or buttons
- [ ] **DISC-03**: Mutual likes automatically create active match and chatroom
- [ ] **DISC-04**: User can view list of their current matches
- [ ] **DISC-05**: User can view their like history (sent likes)
- [ ] **DISC-06**: System prevents viewing already liked/passed profiles in discovery

### Moderated Chat
- [ ] **CHAT-01**: Matched users can send real-time text messages in dedicated chatrooms
- [ ] **CHAT-02**: Supervisor can read all conversations involving users in their region
- [ ] **CHAT-03**: Supervisor can close chatroom to permanently end conversation
- [ ] **CHAT-04**: Cross-region matches are visible to supervisors from both regions
- [ ] **CHAT-05**: Chat messages are persisted and load conversation history
- [ ] **CHAT-06**: Real-time typing indicators show when other user is typing

### Role Management & Administration
- [ ] **ROLE-01**: Superadmin can create and manage regions (name, description)
- [ ] **ROLE-02**: Superadmin can assign supervisor role to users for specific regions  
- [ ] **ROLE-03**: Superadmin can revoke supervisor permissions
- [ ] **ROLE-04**: System maintains audit log of all supervisor actions (approvals, rejections, chat closures)
- [ ] **ROLE-05**: Role-based access control prevents unauthorized API access
- [ ] **ROLE-06**: Superadmin dashboard shows system overview and user statistics

## v2 Requirements (Deferred)

### Enhanced Administration
- [ ] **ADM-01**: Admin role with regional scope between Supervisor and Superadmin
- [ ] **ADM-02**: Admin can manage supervisors within their region
- [ ] **ADM-03**: Complex approval workflows with multi-supervisor review

### Advanced Matching
- [ ] **MATCH-01**: Cross-region match cancellation requires approval from both region supervisors
- [ ] **MATCH-02**: Compatibility scoring based on biodata preferences
- [ ] **MATCH-03**: Advanced filtering (education level, occupation, religion practice level)
- [ ] **MATCH-04**: Recommendation algorithm based on successful matches

### Enhanced Chat Features
- [ ] **CHAT-07**: Photo sharing in conversations with supervisor pre-approval
- [ ] **CHAT-08**: Conversation time limits with automatic closure
- [ ] **CHAT-09**: Family involvement workflow (supervisor can request family contact)

### Mobile Experience
- [ ] **MOB-01**: Native iOS application
- [ ] **MOB-02**: Native Android application  
- [ ] **MOB-03**: Push notifications for matches and messages

## Out of Scope

- **Video/Voice Chat** — Complexity exceeds MVP needs, text sufficient for ta'aruf validation
- **Photo AI Moderation** — Manual supervisor review sufficient for 100-user scale
- **Enterprise Audit Features** — Basic logging adequate for MVP validation
- **Microservices Architecture** — Monolithic Next.js sufficient for target scale
- **Advanced Analytics** — Focus on behavioral validation over metrics dashboard
- **Multi-language Support** — Indonesian/English sufficient for initial market
- **Payment Processing** — Free platform for MVP validation period

## Traceability

### Phase Mapping
*To be populated during roadmap creation*

| Requirement ID | Phase | Plan | Status |
|---------------|-------|------|--------|
| AUTH-01 | TBD | TBD | Not Planned |
| AUTH-02 | TBD | TBD | Not Planned |
| ... | ... | ... | ... |

### Success Criteria Links
*Links requirements to observable user behaviors for validation*

| Requirement ID | Success Criteria | Validation Method |
|---------------|-----------------|-------------------|
| DISC-03 | ≥30% of users achieve matches | Analytics tracking |
| CHAT-01 | ≥50% of matches start conversations | Message analytics |
| SUP-02 | User approval rate tracked | Supervisor dashboard |

---

**Total v1 Requirements**: 25  
**Requirements by Category**:
- Authentication & Onboarding: 7
- Supervision & Approval: 6  
- Discovery & Matching: 6
- Moderated Chat: 6
- Role Management: 6

**Technical Foundation**: Auth.js + Next.js + PostgreSQL + Prisma + Socket.IO