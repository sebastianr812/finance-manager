// IMPORTANT NOTE: ALL ROUTES ARE NOW PUBLIC WITH CLERK INSTEAD OF THE OG WAY
// WHICH ALL ROUTES WERE PROTECTED - WE DECIDE WHAT ROUTES HAVE AUTH IN THEM
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
    "/",
]);

export default clerkMiddleware((auth, req) =>  {
    // we pass the req which the isProtectedRoute checks and sees if it should
    // be protected or not
    if (isProtectedRoute(req)) {
        auth().protect();
    }
    return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

