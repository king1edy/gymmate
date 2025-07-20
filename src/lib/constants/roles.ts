// lib/constants/roles.ts
// Role-based access constants

export const ROLES = {
    ADMIN: 'admin',
    TRAINER: 'trainer',
    STAFF: 'staff',
    MEMBER: 'member',
  } as const;
  
  export const PERMISSIONS = {
    MANAGE_MEMBERS: 'manage_members',
    MANAGE_CLASSES: 'manage_classes',
    MANAGE_EQUIPMENT: 'manage_equipment',
    VIEW_ANALYTICS: 'view_analytics',
    MANAGE_PAYMENTS: 'manage_payments',
    MANAGE_STAFF: 'manage_staff',
  } as const;
  
  export const ROLE_PERMISSIONS: Record<
  (typeof ROLES)[keyof typeof ROLES],
  Array<(typeof PERMISSIONS)[keyof typeof PERMISSIONS]>
> = {
    [ROLES.ADMIN]: Object.values(PERMISSIONS),
    [ROLES.TRAINER]: [
      PERMISSIONS.MANAGE_CLASSES,
      PERMISSIONS.VIEW_ANALYTICS,
    ],
    [ROLES.STAFF]: [
      PERMISSIONS.MANAGE_MEMBERS,
      PERMISSIONS.MANAGE_EQUIPMENT,
    ],
    [ROLES.MEMBER]: [],
  };
  
  export function hasPermission(
    userRole: keyof typeof ROLE_PERMISSIONS,
    permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
  ): boolean {
    return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
  }