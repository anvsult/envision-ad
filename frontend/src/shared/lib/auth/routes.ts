export const ROUTE_PERMISSIONS: Record<string, string | undefined> = {
    '/profile': undefined,
    '/dashboard': undefined,

    '/dashboard/media-owner/media': 'read:media',
    '/dashboard/media-owner/metrics': 'read:media',
    '/dashboard/media-owner/locations': 'read:media',
    '/dashboard/media-owner/ad-requests': 'update:reservation',

    '/dashboard/advertiser/metrics': 'read:campaign',
    '/dashboard/advertiser/campaigns': 'read:campaign',
    '/dashboard/advertiser/advertisements': 'readAll:reservation',

    '/dashboard/admin/media/pending': 'update:verification',
    '/dashboard/admin/organization/verification': 'update:verification',

    '/dashboard/organization/overview': undefined,
    '/dashboard/organization/employees': 'read:employee',
};
