/**
 * Discovery utilities for profile filtering and matching
 */

import { Gender, UserStatus } from '@prisma/client';
import { prisma } from './db';

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Build discovery filters based on user preferences
 * Filters: opposite gender, similar age range, same region
 */
export interface DiscoveryFilters {
  gender: Gender;
  minAge: number;
  maxAge: number;
  regionId: string;
  status: UserStatus;
}

export function buildDiscoveryFilters(userGender: Gender, userAge: number, userRegionId: string): Partial<DiscoveryFilters> {
  // Opposite gender
  const oppositeGender = userGender === Gender.MALE ? Gender.FEMALE : Gender.MALE;

  // Age range: +/- 10 years
  const minAge = Math.max(18, userAge - 10);
  const maxAge = userAge + 10;

  return {
    gender: oppositeGender,
    minAge,
    maxAge,
    regionId: userRegionId,
    status: UserStatus.ACTIVE,
  };
}

/**
 * Get user IDs that should be excluded from discovery
 * (already liked or passed)
 */
export async function getExcludedUserIds(userId: string): Promise<string[]> {
  const [likes, passes] = await Promise.all([
    prisma.like.findMany({
      where: { userId },
      select: { likedUserId: true },
    }),
    prisma.pass.findMany({
      where: { userId },
      select: { passedUserId: true },
    }),
  ]);

  const excludedIds = [
    ...likes.map((like) => like.likedUserId),
    ...passes.map((pass) => pass.passedUserId),
    userId, // Exclude self
  ];

  return excludedIds;
}
