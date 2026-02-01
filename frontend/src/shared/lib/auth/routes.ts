export const ROUTE_PERMISSIONS: Record<string, string | undefined> = {
    '/profile': undefined,
    '/dashboard': undefined,

    '/dashboard/media-owner/media': undefined,

    '/dashboard/advertiser/campaigns': 'read:campaign',

    '/dashboard/admin/media/pending': 'update:verification',
    '/dashboard/admin/organization/verification': 'update:verification',

    '/dashboard/organization/overview': undefined,
    '/dashboard/organization/employees': 'read:employee',
};