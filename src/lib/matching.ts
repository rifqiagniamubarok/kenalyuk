/**
 * Matching utility functions
 * Handles match creation and management
 */

import { prisma } from './db';
import { MatchStatus } from '@prisma/client';

/**
 * Create a match between two users
 * Ensures user1Id < user2Id for consistent ordering
 */
export async function createMatch(userAId: string, userBId: string) {
  // Ensure consistent ordering (smaller ID first)
  const [user1Id, user2Id] =
    userAId < userBId ? [userAId, userBId] : [userBId, userAId];

  // Check if match already exists
  const existingMatch = await prisma.match.findUnique({
    where: {
      user1Id_user2Id: {
        user1Id,
        user2Id,
      },
    },
  });

  if (existingMatch) {
    // If match exists and is UNMATCHED, reactivate it
    if (existingMatch.status === MatchStatus.UNMATCHED) {
      return await prisma.match.update({
        where: { id: existingMatch.id },
        data: { status: MatchStatus.ACTIVE },
      });
    }
    return existingMatch;
  }

  // Create new match
  return await prisma.match.create({
    data: {
      user1Id,
      user2Id,
      status: MatchStatus.ACTIVE,
    },
  });
}
