export const ASSET_CATEGORIES = [
  'All Categories',
  'Equipment',
  'Furniture',
  'Electronics',
  'Vehicles',
] as const;

export const ASSET_STATUSES = {
  ALL: 'All Statuses',
  AVAILABLE: 'AVAILABLE',
  MAINTENANCE: 'MAINTENANCE',
  BROKEN: 'BROKEN',
  NOT_AVAILABLE: 'NOT AVAILABLE',
  ASSIGNED: 'ASSIGNED',
} as const;

// Display names for the status values
export const ASSET_STATUS_DISPLAY = {
  'AVAILABLE': 'Available',
  'MAINTENANCE': 'Maintenance',
  'BROKEN': 'Broken',
  'NOT AVAILABLE': 'Not Available',
  'ASSIGNED': 'Assigned',
} as const;

export const ASSET_STATUS_BADGE_MAP = {
  [ASSET_STATUSES.AVAILABLE]: {
    label: ASSET_STATUS_DISPLAY['AVAILABLE'],
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  [ASSET_STATUSES.MAINTENANCE]: {
    label: ASSET_STATUS_DISPLAY['MAINTENANCE'],
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  [ASSET_STATUSES.BROKEN]: {
    label: ASSET_STATUS_DISPLAY['BROKEN'],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  [ASSET_STATUSES.NOT_AVAILABLE]: {
    label: ASSET_STATUS_DISPLAY['NOT AVAILABLE'],
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  [ASSET_STATUSES.ASSIGNED]: {
    label: ASSET_STATUS_DISPLAY['ASSIGNED'],
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
} as const;
