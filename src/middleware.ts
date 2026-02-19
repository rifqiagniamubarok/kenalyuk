/**
 * Next.js middleware for authentication and authorization
 * Protects routes based on user roles and authentication status
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import { UserRole, UserStatus } from "@/types/auth";

/**
 * Route access control configuration
 */
const routeConfig = {
  // Public routes - no authentication required
  public: ["/", "/auth/login", "/auth/register", "/auth/verify-email", "/auth/error"],
  
  // Protected routes requiring authentication
  protected: {
    // User routes - requires ACTIVE status
    user: ["/dashboard", "/matches", "/profile"],
    
    // Supervisor routes - requires SUPERVISOR or SUPERADMIN role + ACTIVE status
    supervisor: ["/supervisor"],
    
    // Superadmin routes - requires SUPERADMIN role + ACTIVE status
    superadmin: ["/superadmin", "/admin"],
  },
};

/**
 * Check if path matches any route pattern
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

/**
 * Middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except protected API routes)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get session
  const session = await getServerSession();

  // Check if route is public
  const isPublicRoute = matchesRoute(pathname, routeConfig.public);

  // If route is public, allow access
  if (isPublicRoute) {
    // Redirect authenticated users away from auth pages
    if (session && pathname.startsWith("/auth/")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // For protected routes, require authentication
  if (!session) {
    const signInUrl = new URL("/auth/login", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const { user } = session;

  // Check role-based access
  
  // Superadmin routes
  if (matchesRoute(pathname, routeConfig.protected.superadmin)) {
    if (user.role !== UserRole.SUPERADMIN) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.redirect(new URL("/auth/pending", request.url));
    }
    return NextResponse.next();
  }

  // Supervisor routes
  if (matchesRoute(pathname, routeConfig.protected.supervisor)) {
    if (user.role !== UserRole.SUPERVISOR && user.role !== UserRole.SUPERADMIN) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.redirect(new URL("/auth/pending", request.url));
    }
    return NextResponse.next();
  }

  // User routes (dashboard, matches, profile)
  if (matchesRoute(pathname, routeConfig.protected.user)) {
    // Check if user needs to complete profile or wait for approval
    if (
      user.status === UserStatus.PENDING_VERIFICATION ||
      user.status === UserStatus.PENDING_APPROVAL
    ) {
      // Allow profile page for completing profile
      if (pathname.startsWith("/profile")) {
        return NextResponse.next();
      }
      // Redirect others to pending page
      return NextResponse.redirect(new URL("/auth/pending", request.url));
    }

    // Check if user is rejected or suspended
    if (
      user.status === UserStatus.REJECTED ||
      user.status === UserStatus.SUSPENDED
    ) {
      return NextResponse.redirect(new URL("/auth/suspended", request.url));
    }

    // User is ACTIVE, allow access
    return NextResponse.next();
  }

  // Default: allow access if authenticated
  return NextResponse.next();
}

/**
 * Middleware configuration - specify which routes to run middleware on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
