import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // First, handle Supabase session refresh
  const supabaseResponse = await updateSession(request);

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
