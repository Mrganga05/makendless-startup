/** NEXT_DIST lets a dev server and a production build run side by side without sharing a cache folder. */
export default { reactStrictMode: true, poweredByHeader: false, distDir: process.env.NEXT_DIST || ".next" };
