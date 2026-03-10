import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ["/events", "/members", "/compositions", "/profile"];

function getPathWithoutLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(`/${locale}`.length);
    }
    if (pathname === `/${locale}`) {
      return "/";
    }
  }
  return pathname;
}

function isProtectedPath(pathname: string): boolean {
  const path = getPathWithoutLocale(pathname);
  return protectedPaths.some((p) => path === p || path.startsWith(`${p}/`));
}

function getLocaleFromPath(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return routing.defaultLocale;
}

export default async function middleware(request: NextRequest) {
  // First, handle Supabase session refresh
  const supabaseResponse = await updateSession(request);

  // Check auth for protected routes
  if (isProtectedPath(request.nextUrl.pathname)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Read-only — session was already refreshed by updateSession
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const locale = getLocaleFromPath(request.nextUrl.pathname);
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Then, handle i18n routing
  const intlResponse = intlMiddleware(request);

  // Merge cookies from Supabase session into the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - API routes (/api/...)
    // - Next.js internals (/_next/...)
    // - Static files (favicon, images, manifest, sw)
    "/((?!api|_next|.*\\..*).*)",
  ],
};
