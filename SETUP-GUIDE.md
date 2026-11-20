# Setup guide (no coding needed)

Do these once. Each step says exactly where to click. Keys go into **Vercel only**, never into the code.

## 1. Database: Supabase (free)
1. Open https://supabase.com → **Start your project** → **Continue with GitHub** (or sign up with makendlessofficial@gmail.com).
2. Click **New project**. Name: `makendless`. Set a database password (save it somewhere safe). Region: **Mumbai (ap-south-1)**. Click **Create new project** and wait about 2 minutes.
3. Left menu → **SQL Editor** → **New query**. Open the file `supabase/schema.sql` from this project, copy everything, paste it, click **Run**. You should see "Success".
4. Left menu → **Authentication** → **URL Configuration**:
   - **Site URL**: `https://makendless.vercel.app`
   - **Redirect URLs** → **Add URL**: `https://makendless.vercel.app/admin` → **Save**.
5. Left menu → **Project Settings** (gear) → **API Keys** (or **API**). Keep this tab open; you need 3 values:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon / publishable** key
   - **service_role / secret** key (click **Reveal**). Keep this one secret.

## 2. Email alerts: Resend (free)
1. Open https://resend.com → **Sign up** with **makendlessofficial@gmail.com** (important: on the free plan Resend only sends to the email you signed up with).
2. Left menu → **API Keys** → **Create API Key** → name `makendless` → permission **Sending access** → **Add**. Copy the key (starts with `re_`).

## 3. Put the keys into Vercel
1. Open https://vercel.com → your project **makendless-startup** → **Settings** → **Environment Variables**.
2. Add each of these (Name → Value), tick **Production**, **Preview** and **Development**, click **Save**:
   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | the Project URL |
   | `SUPABASE_ANON_KEY` | the anon / publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role / secret key |
   | `RESEND_API_KEY` | the Resend key |
3. Top menu → **Deployments** → on the newest one click **⋯** → **Redeploy** → **Redeploy**.

## 4. Check it works
1. Open https://makendless.vercel.app/contact, fill in the form, press **Review my brief**, then **Start a Project**. You should see "Thanks, …".
2. Check the inbox of makendlessofficial@gmail.com for "New lead: …" (look in Spam the first time and mark it "Not spam").
3. Open https://makendless.vercel.app/admin → enter makendlessofficial@gmail.com → **Send login link** → open the email on the same device → you're in.
4. Tell Claude "the keys are in Vercel" to run the final checks (saved lead, email, public can't read the leads table).

## Change details later
- Email, WhatsApp number, WhatsApp message, Instagram/YouTube links: `data/owner.ts` (one file).
- Prices: `data/pricing.ts`. Combo packs come back by setting `COMBOS_ENABLED = true` there.
- Sample links ("See samples ↗"): `data/samples.ts`. Real work ("Our work" section): `data/work.ts`.
- Team members and the alert email: /admin → **Settings**.
