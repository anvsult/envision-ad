import createMiddleware from "next-intl/middleware";
import { routing } from "@/shared/lib/i18n/routing";
import { auth0 } from "@/shared/api/auth0/auth0";
import { NextRequest, NextResponse } from "next/server";
import { Auth0ManagementService } from "@/shared/api/auth0/management";

const intlMiddleware = createMiddleware(routing);

function isValidLocale(locale: string): locale is (typeof routing.locales)[number] {
  return (routing.locales as readonly string[]).includes(locale);
}

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return await auth0.middleware(request)
  }

  const session = await auth0.getSession(request);

  if (session?.user) {
    let preferredLang = request.cookies.get('user_preferred_language')?.value;

    if (!preferredLang) {
      try {
        preferredLang = await Auth0ManagementService.getUserLanguage(session.user.sub);

        if (preferredLang && isValidLocale(preferredLang)) {
          const response = intlMiddleware(request);
          response.cookies.set('user_preferred_language', preferredLang, {
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
          });
        }
      } catch (error) {
        console.error('Failed to fetch user preferred language:', error);
      }
    }

    const localeMatch = request.nextUrl.pathname.match(
        new RegExp(`^/(${routing.locales.join('|')})(/.*)?$`)
    );
    const currentLocale = localeMatch ? localeMatch[1] : null;

    if (preferredLang && isValidLocale(preferredLang) && currentLocale && preferredLang !== currentLocale) {
      const newPathname = request.nextUrl.pathname.replace(
          new RegExp(`^/${currentLocale}(/|$)`),
          `/${preferredLang}$1`
      );

      const url = new URL(newPathname, request.url);
      url.search = request.nextUrl.search;

      return NextResponse.redirect(url);
    }
  }

  // const session = await auth0.getSession(request);

  // if (
  //   new RegExp(`^/(${routing.locales.join('|')})/dashboard(/.*)?$`).test(request.nextUrl.pathname)
  //   && !session
  // ) {
  //   const localeMatch = request.nextUrl.pathname.match(new RegExp(`^/(${routing.locales.join('|')})/?`));
  //   const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
  //   return NextResponse.redirect(
  //     new URL(`/auth/login?returnTo=/${locale}/dashboard&ui_locales=${locale}`, request.nextUrl.origin)
  //   );
  // }

  const intlResponse = intlMiddleware(request)

  const authResponse = await auth0.middleware(request);
  for (const [key, value] of authResponse.headers) {
    if (key.toLowerCase() === 'x-middleware-next') {
      if (intlResponse.status >= 300) {
        continue;
      }
    }
    intlResponse.headers.set(key, value);
  }
  return intlResponse
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
  ],
};
