import useAuthStore from '@/stores/auth';

export interface User {
  role?: string;
  // Add other user properties as needed
}

export const usePermissions = () => {
  const { user } = useAuthStore();

  return {
    canAccessUserManagement: user?.role === 'super_admin',
    canAccessLogs: user?.role === 'super_admin',
    canAccessAllSettings: user?.role === 'super_admin',
    canManageLocations: user?.role === 'super_admin',
    canManageVendors: user?.role === 'super_admin',
    canManageCategories: user?.role === 'super_admin',
    canAccessEmailSettings: true, // All authenticated users can access email settings
    canAccessNotificationSettings: true, // All authenticated users can access notification settings
    isSuperAdmin: user?.role === 'super_admin',
    isBranchAdmin: user?.role === 'branch_admin',
  };
};

export const checkPermission = (user: User | undefined, permission: string): boolean => {
  if (!user) return false;

  switch (permission) {
    case 'access_user_management':
    case 'access_logs':
    case 'manage_locations':
    case 'manage_vendors':
    case 'manage_categories':
      return user.role === 'super_admin';
    case 'access_email_settings':
    case 'access_notification_settings':
      return true; // All authenticated users
    default:
      return false;
  }
};
