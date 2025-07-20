// lib/db/utils.ts
// Database utility functions

import { db } from './index';
import { auditLogs, gyms, gymSettings, users } from './schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get gym by slug
 */
export async function getGymBySlug(slug: string) {
  const gym = await db.query.gyms.findFirst({
    where: eq(gyms.slug, slug),
  });
  
  return gym;
}

/**
 * Get user with gym information
 */
export async function getUserWithGym(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      gym: true,
      member: true,
      trainer: true,
      staff: true,
    },
  });
  
  return user;
}

/**
 * Check if user belongs to gym
 */
export async function userBelongsToGym(userId: string, gymId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, userId), eq(users.gymId, gymId)),
  });
  
  return !!user;
}

/**
 * Get gym settings
 */
export async function getGymSettings(gymId: string) {
  const settings = await db.query.gymSettings.findMany({
    where: eq(gymSettings.gymId, gymId),
  });
  
  // Convert to key-value object
  return settings.reduce((acc, setting) => {
    let value: any = setting.settingValue;
    
    // Parse JSON values
    if (setting.settingType === 'json' && value) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }
    
    // Convert boolean values
    if (setting.settingType === 'boolean') {
      value = String(value) === 'true';
    }
    
    // Convert number values
    if (setting.settingType === 'number') {
      value = Number(value);
    }
    
    acc[setting.settingKey] = value;
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Update gym setting
 */
export async function updateGymSetting(
  gymId: string, 
  key: string, 
  value: any, 
  type: 'string' | 'number' | 'boolean' | 'json' = 'string'
) {
  let stringValue = String(value);
  
  if (type === 'json') {
    stringValue = JSON.stringify(value);
  }
  
  await db.insert(gymSettings).values({
    id: crypto.randomUUID(),
    gymId,
    settingKey: key,
    settingValue: stringValue,
    settingType: type,
  }).onConflictDoUpdate({
    target: [gymSettings.gymId, gymSettings.settingKey],
    set: {
      settingValue: stringValue,
      settingType: type,
      updatedAt: new Date(),
    },
  });
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  gymId: string,
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId: string | null,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string,
  userAgent?: string
) {
  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    gymId,
    userId,
    action,
    resourceType,
    resourceId,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
  });
}