---
phase: 02-discovery-&-matching-core
plan: 01
subsystem: database
tags: [prisma, postgresql, schema, discovery, matching, relationships]

requires:
  - phase: 01-foundation
    provides: User model with authentication and biodata
provides:
  - Like model for tracking user likes
  - Pass model for tracking user passes
  - Match model for tracking mutual likes
  - MatchStatus enum for match state management
  - Complete database schema for discovery and matching system
affects: [02-02-discovery-feed, 02-03-actions, 02-04-history, matching, discovery]

tech-stack:
  added: []
  patterns:
    - Bidirectional relationship pattern for user interactions
    - Unique constraints to prevent duplicate actions
    - Cascade delete for referential integrity

key-files:
  created:
    - prisma/migrations/20260222104002_add_discovery_matching_tables/migration.sql
  modified:
    - prisma/schema.prisma

key-decisions:
  - 'Used separate Like and Pass models instead of single Action model for cleaner querying'
  - 'Match model uses normalized user1Id/user2Id instead of keeping original direction'
  - 'CASCADE delete ensures orphaned records are removed when users are deleted'
  - 'Indexes on userId, likedUserId/passedUserId, and createdAt for optimal query performance'

patterns-established:
  - 'Bidirectional relationship pattern: Like/Pass connect users in one direction, Match in both'
  - 'Unique constraints: [userId, likedUserId] and [user1Id, user2Id] prevent duplicates'
  - 'Status enum pattern: MatchStatus tracks match lifecycle (ACTIVE/UNMATCHED)'

duration: 5min
completed: 2026-02-22
---

# Phase 02-01: Database Schema for Discovery & Matching

**Established complete Prisma schema with Like, Pass, Match models and MatchStatus enum for the discovery and matching system**

## Performance

- **Duration:** ~5 minutes
- **Started:** 2026-02-22 17:38:00
- **Completed:** 2026-02-22 17:41:03
- **Tasks:** 2 completed
- **Files modified:** 2 files (+173 lines)

## Accomplishments

- Created Like model tracking when users like each other with userId and likedUserId relations
- Created Pass model tracking when users pass on each other with userId and passedUserId relations
- Created Match model tracking mutual likes with user1Id, user2Id, and status tracking
- Added MatchStatus enum (ACTIVE, UNMATCHED) for match lifecycle management
- Generated and applied database migration with all tables, indexes, and foreign keys
- Established bidirectional relationship pattern between User and discovery models

## Task Commits

Tasks were combined into a single atomic commit:

1. **Tasks 1-2: Schema models + migration** - `d5c7ddc` (feat)
   - Added MatchStatus enum (ACTIVE, UNMATCHED)
   - Added Like model with userId, likedUserId, unique constraint
   - Added Pass model with userId, passedUserId, unique constraint
   - Added Match model with user1Id, user2Id, status tracking
   - Created migration with foreign keys to User table
   - Added indexes for optimal query performance

## Files Created/Modified

### Created

- **prisma/migrations/20260222104002_add_discovery_matching_tables/migration.sql** - Database migration creating likes, passes, matches tables with indexes and foreign keys

### Modified

- **prisma/schema.prisma** - Added MatchStatus enum, Like, Pass, Match models with full relations to User

## Schema Details

### MatchStatus Enum

```prisma
enum MatchStatus {
  ACTIVE      // Match is active
  UNMATCHED   // Users have unmatched
}
```

### Like Model

- **Purpose:** Track when a user likes another user
- **Fields:** id (UUID), userId, likedUserId, createdAt
- **Relations:** user (who liked), likedUser (who was liked)
- **Constraints:** Unique [userId, likedUserId] prevents duplicate likes
- **Indexes:** userId, likedUserId, createdAt for efficient queries
- **Cascade:** DELETE CASCADE when either user is deleted

### Pass Model

- **Purpose:** Track when a user passes on another user
- **Fields:** id (UUID), userId, passedUserId, createdAt
- **Relations:** user (who passed), passedUser (who was passed)
- **Constraints:** Unique [userId, passedUserId] prevents duplicate passes
- **Indexes:** userId, passedUserId for efficient queries
- **Cascade:** DELETE CASCADE when either user is deleted

### Match Model

- **Purpose:** Track mutual likes between two users
- **Fields:** id (UUID), user1Id, user2Id, status, createdAt, updatedAt
- **Relations:** user1, user2
- **Constraints:** Unique [user1Id, user2Id] prevents duplicate matches
- **Indexes:** user1Id, user2Id, status, updatedAt for efficient queries
- **Status:** Defaults to ACTIVE, can be changed to UNMATCHED
- **Cascade:** DELETE CASCADE when either user is deleted

### User Model Relations Added

```prisma
// Discovery and matching relations
likes          Like[]  @relation("UserLikes")
likedBy        Like[]  @relation("UserLikedBy")
passes         Pass[]  @relation("UserPasses")
passedBy       Pass[]  @relation("UserPassedBy")
matchesAsUser1 Match[] @relation("MatchUser1")
matchesAsUser2 Match[] @relation("MatchUser2")
```

## Database Verification

All three tables created successfully in PostgreSQL:

- ✅ **likes** table with userId, likedUserId, foreign keys, unique constraint, indexes
- ✅ **passes** table with userId, passedUserId, foreign keys, unique constraint, indexes
- ✅ **matches** table with user1Id, user2Id, status enum, foreign keys, unique constraint, indexes
- ✅ **MatchStatus** enum type created (ACTIVE, UNMATCHED)
- ✅ All foreign key constraints to users table working
- ✅ All indexes created for query optimization

## Decisions Made

**1. Separate Like and Pass models**

- Could have used single "Action" model with type field
- Chose separate models for clearer code and simpler queries
- Easier to add model-specific fields later if needed

**2. Match model normalization**

- Match doesn't track who liked first
- Uses user1Id/user2Id instead of initiatorId/recipientId
- Simpler queries, order doesn't matter for matches

**3. Cascade delete strategy**

- All discovery tables use CASCADE DELETE
- When user deleted, all their likes/passes/matches removed
- Maintains referential integrity without manual cleanup

**4. Index strategy**

- Index on userId for "my likes/passes" queries
- Index on likedUserId/passedUserId for "who liked/passed me" queries
- Index on createdAt for chronological ordering
- Index on status for filtering active matches
- Index on updatedAt for recently changed matches

## Deviations from Plan

None - plan executed exactly as written. Schema models match specifications, migration created and applied successfully, all indexes and constraints implemented as designed.

## Requirements Addressed

**DISC-01 Foundation:** ✅ Complete

- Database schema established for discovery system
- Models support like/pass actions and match creation
- Ready for discovery feed API implementation (next plan)

## Next Steps

- **02-02:** Discovery Feed API - implement endpoint to fetch potential matches
- **02-03:** Like/Pass Actions - create API endpoints for user actions and match creation
- **02-04:** Matches & Likes History - build views for user's matches and interaction history
