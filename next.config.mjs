/** NEXT_DIST lets a dev server and a production build run side by side without sharing a cache folder. */
export default { reactStrictMode: true, poweredByHeader: false, distDir: process.env.NEXT_DIST || ".next",
  /* The team dashboard and every API stay out of search engines. */
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [{ source: "/admin", headers: noindex }, { source: "/admin/:path*", headers: noindex }, { source: "/api/:path*", headers: noindex }];
  },
};
