import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    // If locales use the same pathname
    '/': '/',

    '/forbidden': {
      'en': '/forbidden',
      'fr': '/interdit'
    },

    // If locales use different paths
    '/profile': {
      'en': '/profile',
      'fr': '/profil'
    },
    '/browse': {
      'en': '/browse',
      'fr': '/parcourir'
    },
    '/about': {
      'en': '/about',
      'fr': '/a-propos'
    },
    '/dashboard': {
      'en': '/dashboard',
      'fr': '/tableau-de-bord'
    },

    //dashboards

    //media Owner dashboard
    '/dashboard/media-owner/media': {
      'en': '/dashboard/media-owner/media',
      'fr': '/tableau-de-bord/media-owner/media'
    },
    '/dashboard/media-owner/proof': {
      'en': '/dashboard/media-owner/proof',
      'fr': '/tableau-de-bord/media-owner/preuve'
    },

    //advertiser dashboard
    '/dashboard/advertiser/metrics': {
      'en': '/dashboard/advertiser/metrics',
      'fr': '/tableau-de-bord/annonceur/metriques'
    },
    '/dashboard/advertiser/overview': {
      'en': '/dashboard/advertiser/overview',
      'fr': '/tableau-de-bord/annonceur/apercu'
    },
    '/dashboard/advertiser/campaigns': {
      'en': '/dashboard/advertiser/campaigns',
      'fr': '/tableau-de-bord/annonceur/campagnes'
    },

    // admin dashboard
    "/dashboard/admin/media/pending": {
      'en': "/dashboard/admin/media/pending",
      'fr': "/tableau-de-bord/admin/media/en-attente",
    },
    "/dashboard/admin/organization/verification": {
      'en': "/dashboard/admin/organization/verification",
      'fr': "/tableau-de-bord/admin/organization/verification",
    },

    //organization dashboard
    '/dashboard/organization/overview': {
      'en': '/dashboard/organization/overview',
      'fr': '/tableau-de-bord/entreprise/apercu'
    },
    '/dashboard/organization/employees': {
      'en': '/dashboard/organization/employees',
      'fr': '/tableau-de-bord/entreprise/employes'
    }
  }
});