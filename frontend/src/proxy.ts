import createMiddleware from "next-intl/middleware";
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Skip middleware for API routes, static files, and Next.js internals
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
}