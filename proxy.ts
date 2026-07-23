import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect to correct dashboard based on role
      const role = req.auth?.user?.role;
      if (role === "Admin" || role === "Legal") {
        return Response.redirect(new URL("/dashboard", req.nextUrl));
      } else {
        return Response.redirect(new URL("/dashboard/chat", req.nextUrl));
      }
    }
    return NextResponse.next();
  }

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }

    const role = req.auth?.user?.role || "User";

    // Since we removed Beranda, all requests to /dashboard go to /dashboard/chat
    if (req.nextUrl.pathname === '/dashboard') {
      return Response.redirect(new URL("/dashboard/chat", req.nextUrl));
    }

    // Role restrictions for User
    if (role === "User") {
      if (req.nextUrl.pathname.startsWith('/dashboard/documents') || req.nextUrl.pathname.startsWith('/dashboard/analytics') || req.nextUrl.pathname.startsWith('/dashboard/admin')) {
        return Response.redirect(new URL("/dashboard/chat", req.nextUrl));
      }
    }

    // Role restrictions for Legal
    if (role === "Legal") {
      if (req.nextUrl.pathname.startsWith('/dashboard/admin')) {
        return Response.redirect(new URL("/dashboard/chat", req.nextUrl));
      }
    }
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
