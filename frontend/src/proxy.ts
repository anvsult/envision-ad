import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";
import { auth0 } from "./lib/auth0/auth0";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authResponse = await auth0.middleware(request);

  if (authResponse?.headers.get("location")) {
    return authResponse;
  }

  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
  ],
};
