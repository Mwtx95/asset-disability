export const ASSET_CATEGORIES = [
  'All Categories',
  'Equipment',
  'Furniture',
  'Electronics',
  'Vehicles',
] as const;

export const ASSET_STATUSES = {
  ALL: 'All Statuses',
  AVAILABLE: 'Available',
  MAINTENANCE: 'Maintenance',
  BROKEN: 'Broken',
  NOT_AVAILABLE: 'Not Available',
  ASSIGNED: 'Assigned',
} as const;

export const ASSET_STATUS_BADGE_MAP = {
  [ASSET_STATUSES.AVAILABLE]: {
    label: ASSET_STATUSES.AVAILABLE,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  [ASSET_STATUSES.MAINTENANCE]: {
    label: ASSET_STATUSES.MAINTENANCE,
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  [ASSET_STATUSES.BROKEN]: {
    label: ASSET_STATUSES.BROKEN,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  [ASSET_STATUSES.NOT_AVAILABLE]: {
    label: ASSET_STATUSES.NOT_AVAILABLE,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
} as const;
