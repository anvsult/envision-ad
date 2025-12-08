import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";
import { auth0 } from "./lib/auth0/auth0";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return await auth0.middleware(request)
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
