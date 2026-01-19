import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  pathnames: {
    // If locales use the same pathname
    '/': '/',

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
    '/dashboard/media-owner/overview': {
      'en': '/dashboard/media-owner/overview',
      'fr': '/tableau-de-bord/media-owner/apercu'
    },
    '/dashboard/media-owner/media': {
      'en': '/dashboard/media-owner/media',
      'fr': '/tableau-de-bord/media-owner/media'
    },
    '/dashboard/media-owner/proof': {
      'en': '/dashboard/media-owner/proof',
      'fr': '/tableau-de-bord/media-owner/preuve'
    },

    '/dashboard/media-owner/displayed-ads': {
      'en': '/dashboard/media-owner/displayed-ads',
      'fr': '/tableau-de-bord/media-owner/annonces-affichees'
    },
    '/dashboard/media-owner/ad-requests': {
      'en': '/dashboard/media-owner/ad-requests',
      'fr': '/tableau-de-bord/media-owner/demandes-annonces'
    },
    '/dashboard/media-owner/transactions': {
      'en': '/dashboard/media-owner/transactions',
      'fr': '/tableau-de-bord/media-owner/transactions'
    },

    //advertiser dashboard
    '/dashboard/advertiser/overview': {
      'en': '/dashboard/advertiser/overview',
      'fr': '/tableau-de-bord/annonceur/apercu'
    },
    '/dashboard/advertiser/campaigns': {
      'en': '/dashboard/advertiser/campaigns',
      'fr': '/tableau-de-bord/annonceur/campagnes'
    },
    '/dashboard/advertiser/ad-requests': {
      'en': '/dashboard/advertiser/ad-requests',
      'fr': '/tableau-de-bord/annonceur/demandes-annonces'
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