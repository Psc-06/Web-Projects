import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/spotify/:path*", "/api/calendar/:path*", "/api/tasks/:path*", "/api/fitness/:path*"],
};
