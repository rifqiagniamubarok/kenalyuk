# Kenalyuk! - Syariah-Compliant Matchmaking Platform

## What This Is

**Kenalyuk!** is a syariah-compliant matchmaking platform that combines modern swipe-based UX (Tinder/Bumble) with human moral supervision and regional trust networks. It creates digital infrastructure for contemporary Muslim marriage by balancing modern dating app convenience with Islamic values and ethical oversight.

## Core Value

**Supervised digital ta'aruf that builds real marriages.** Users get the modern, efficient discovery experience they expect, while supervisors ensure interactions align with Islamic principles and serious marriage intentions.

## The Problem

Existing dating apps create misalignment with serious marriage intentions, especially for users seeking syariah-compliant ta'aruf:

- **Casual intent dominance**: Most users pursue casual relationships, entertainment, or social validation rather than marriage
- **Lack of ethical supervision**: Conversations drift inappropriately, ghosting is common, no accountability layer
- **Existing ta'aruf apps fail**: Either too rigid (poor UX) or too loose (not truly syariah-compliant), with weak moderation and low digital trust

## The Solution

**Regional supervision + modern UX** creates a middle ground between overly permissive dating apps and overly restrictive traditional ta'aruf platforms.

**Key Innovation**: Local supervisors understand cultural context and build stronger trust than centralized authority. Users know "someone from my region supervises this process," increasing safety perception and seriousness of intent.

## Target Market

**Primary**: Indonesian Muslims seeking marriage-oriented relationships, starting with major cities (Jakarta, Bandung, Yogyakarta, Medan, Surabaya) before expanding province by province.

**MVP Scale**: 100 active users across 2-3 cities to prove behavioral depth before scaling.

## Success Vision

**Immediate (MVP)**: 2-3 real marriage-intention journeys among first 100 users, with ≥60% user retention, ≥30% match rate, and ≥50% meaningful chat conversion.

**Long-term**: Foundational digital infrastructure for modern Muslim marriage across Indonesia and potentially broader Southeast Asian Muslim communities.

## Key Constraints

- **Budget**: Extreme cost efficiency required (free/low-cost cloud services, single VPS approach)
- **Team**: Solo development with AI assistance (Copilot, GPT, Cursor)
- **Timeline**: 2-3 months MVP for fast real-world behavioral validation
- **Performance**: Optimized for Indonesian market (mid-range Android, variable internet, mobile-first)
- **Scale**: Designed for simplicity and stability over premature scalability

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Authentication & Onboarding (Weeks 1-2)**

- [ ] **AUTH-01**: User can register with email/password and verify email
- [ ] **AUTH-02**: User can complete biodata (name, gender, age, height, city, region, education, occupation, religion level, about me, preferences)
- [ ] **AUTH-03**: User can upload 5-9 photos with compression
- [ ] **AUTH-04**: User status becomes PENDING_APPROVAL after completion

**Supervision & Approval (Weeks 1-2)**

- [ ] **SUP-01**: Supervisor can view pending users in their region
- [ ] **SUP-02**: Supervisor can approve/reject users with reason
- [ ] **SUP-03**: User status updates to ACTIVE/REJECTED based on supervisor decision
- [ ] **SUP-04**: Re-approval required when user edits biodata or photos

**Discovery & Matching (Weeks 3-5)**

- [ ] **DISC-01**: Active users can view discovery list filtered by gender, region preference, and age range
- [ ] **DISC-02**: User can like/pass on profiles (swipe mechanic)
- [ ] **DISC-03**: Mutual likes create active match and chatroom
- [ ] **DISC-04**: User can view list of their matches

**Moderated Chat (Weeks 6-8)**

- [ ] **CHAT-01**: Users can send real-time text messages in match chatrooms
- [ ] **CHAT-02**: Supervisor can read conversations involving users in their region
- [ ] **CHAT-03**: Supervisor can close chatroom to end conversation
- [ ] **CHAT-04**: Cross-region matches visible to supervisors from both regions

**Role Management**

- [ ] **ROLE-01**: Superadmin can create/manage regions
- [ ] **ROLE-02**: Superadmin can assign supervisor roles to specific regions
- [ ] **ROLE-03**: Audit logging for all supervisor actions

### Out of Scope (MVP)

- **Complex admin hierarchy** — Simplify to Supervisor + Superadmin only
- **Cross-region cancellation voting** — Handle manually via superadmin for MVP
- **Mobile apps** — Web-first, mobile-optimized responsive design
- **Advanced matching algorithms** — Simple chronological/random discovery
- **Enterprise audit features** — Basic logging sufficient for 100 users
- **Microservices architecture** — Single Next.js codebase for simplicity

## Key Decisions

| Decision                                       | Rationale                                                                           | Outcome                                                                |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Next.js monolith over microservices            | Solo development needs simplicity, 100 users don't require distributed architecture | Faster development, easier AI assistance                               |
| Regional supervisors vs central moderation     | Indonesian cultural diversity, stronger local trust, organizational scalability     | Distributed moral authority, culturally aware moderation               |
| Supervisors can read chats, superadmins cannot | Balance privacy with oversight, prevent centralized surveillance feel               | Limited scope moderation, user trust protection                        |
| Text-only chat for MVP                         | Reduce complexity, focus on core behavioral validation                              | Faster implementation, sufficient for marriage-intention conversations |
| Personal supervisor recruitment initially      | Trust is foundational, need verified first cohort for 100-user validation           | Relationship-based vetting, tight trust loop                           |
| Week-by-week feature prioritization            | Solo + AI development needs cognitive load management, early behavioral validation  | Foundation → Matching → Chat sequence prevents architectural rework    |

## Technical Approach

**Stack**: Next.js (App Router) + TypeScript + PostgreSQL + Prisma + Socket.IO + TailwindCSS
**Architecture**: Monolithic for MVP simplicity, optimized for Indonesian mobile performance
**Development**: Solo + AI coding tools (GitHub Copilot, GPT, Cursor)
**Hosting**: Single VPS or small cloud instance, managed PostgreSQL if cost-effective

## Success Metrics

**Quantitative Validation**:

- ≥60% of approved users remain active after 2 weeks
- ≥30% of users achieve at least one match
- ≥50% of matches start meaningful chat
- Observable real-world ta'aruf progression

**Qualitative Validation**:

- Users feel safer than dating apps, less awkward than traditional ta'aruf
- Supervisors feel manageable workload and meaningful role
- Evidence of serious marriage intent in conversations

**Critical Success Signal**: 2-3 real marriage-intention journeys among first 100 users validates entire concept.

---

_Last updated: February 19, 2026 after initialization_
