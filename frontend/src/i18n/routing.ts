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
        'fr': '/connection'
    },
    '/browse': {
      'en': '/browse',
      'fr': '/parcourir'
    },
    '/about': {
      'en': '/about',
      'fr': '/a-propos'
    },
  }
});