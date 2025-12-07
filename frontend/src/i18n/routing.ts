import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  pathnames: {
    // If locales use the same pathname
    '/': '/',

    // If locales use different paths
    '/register': {
        'en': '/register',
        'fr': '/inscription'
    },
    '/signin': {
        'en': '/signin',
        'fr': '/connexion'
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
    '/dashboard/overview': {
        'en': '/dashboard/overview',
        'fr': '/tableau-de-bord/apercu'
    },
    '/dashboard/displayed-ads': {
        'en': '/dashboard/displayed-ads',
        'fr': '/tableau-de-bord/annonces-affichees'
    },
    '/dashboard/ad-requests': {
        'en': '/dashboard/ad-requests',
        'fr': '/tableau-de-bord/demandes-annonces'
    },
    '/dashboard/transactions': {
        'en': '/dashboard/transactions',
        'fr': '/tableau-de-bord/transactions'
    }
  }
});