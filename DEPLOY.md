# Putting MAKENDLESS online (with your own domain)

The site is a standard Next.js app. The simplest host is **Vercel** (made by the Next.js team, free "Hobby" plan is enough to start).

## 1. Deploy
1. Go to https://vercel.com → **Sign up with GitHub** (use the **Mrganga05** account).
2. **Add New → Project** → pick the repo **Mrganga05/makendless-startup** → **Import**.
3. Under **Environment Variables** add:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` (your real domain, no trailing slash) |
   | `NEXT_PUBLIC_CONTACT_EMAIL` | your real inquiry email (optional — leave empty until decided) |
4. Click **Deploy**. You get a free `*.vercel.app` link in about 2 minutes.

`NEXT_PUBLIC_SITE_URL` matters for SEO: it is used for canonical links, the sitemap, social share previews and the structured data.

## 2. Connect your domain
1. Vercel → your project → **Settings → Domains** → type `yourdomain.com` → **Add** (also add `www.yourdomain.com`).
2. Vercel shows the DNS records to create. At your domain registrar (GoDaddy, Namecheap, Hostinger, …) add exactly those, usually:
   - `A` record, host `@`, value `76.76.21.21`
   - `CNAME` record, host `www`, value `cname.vercel-dns.com`
3. Wait for DNS (minutes to a few hours). Vercel issues the HTTPS certificate automatically.
4. If you set `NEXT_PUBLIC_SITE_URL` after the first deploy, click **Redeploy** once.

## 3. After launch
- Submit `https://yourdomain.com/sitemap.xml` in **Google Search Console** (free) to get indexed.
- Every `git push` to `main` redeploys the site automatically.

## Run locally
```bash
npm install
npm run build && npx next start -p 3456   # production preview at http://localhost:3456
npm run dev                               # development with hot reload
```
