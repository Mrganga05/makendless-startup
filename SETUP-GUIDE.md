# Setup guide (no coding needed)

Updated 2026-11-23. Do these once. Each step says exactly where to click. Keys go into **Vercel only**, never into the code or a chat.

## Where the forms send their data
All three public forms send to the website's own server, which saves them in Supabase and shows them in /admin:
| Form | Sent to | Saved in Supabase | Shows in /admin as |
|---|---|---|---|
| Start a Project (`/start-project`) and the contact brief (`/contact`) | `/api/leads` | `leads` (+ `referral_uses` when a code is used) + email alert | Source **Form** |
| Refer and earn (homepage) | `/api/referral` | `referral_codes` + `leads` | Source **Referral**, and the Referrals tab |
| GROW waitlist (`/grow`) | `/api/waitlist` | `waitlist` + `leads` | Source **Waitlist** |
| Chatbot "MAKENDLESS Assistant" (round button above WhatsApp) | `/api/chat` | `leads` + email alert | Source **Chatbot** |

If the database is not connected, a form shows "send it on WhatsApp instead" and nothing is saved.

## 0. Already connected? Check first
Open https://vercel.com → project **makendless-startup** → **Settings** → **Environment Variables**.
If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are in the list, the database is connected: skip to **step 3**.

## 1. Create the database: Supabase (free)
1. Open https://supabase.com → **Start your project** → sign up with **makendlessofficial@gmail.com** (or Continue with GitHub).
2. **New project**. Name: `makendless`. Set a database password (save it somewhere safe). Region: **Mumbai (ap-south-1)**. Click **Create new project** and wait about 2 minutes.
3. Left menu → **Project Settings** (gear) → **API Keys**. Keep this tab open; you need 3 values:
   - **Project URL** (looks like `https://abcd1234.supabase.co`; also under Project Settings → **Data API**)
   - **anon / publishable** key
   - **service_role / secret** key (click **Reveal**). This one is secret: it can read everything.

## 2. Put the keys into Vercel
1. Vercel → **makendless-startup** → **Settings** → **Environment Variables**.
2. Add each line below (Name → Value). Tick **Production**, **Preview** and **Development**. Click **Save** after each.
   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | the Project URL |
   | `SUPABASE_ANON_KEY` | the anon / publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role / secret key |
   | `RESEND_API_KEY` | optional: the Resend key for new-lead emails (step 7) |
   | `CRON_SECRET` | optional: any long random text (40 letters and numbers) for the weekly backup |
   | `ANTHROPIC_API_KEY` | the Claude API key for the chatbot (step 8) |
3. Top menu → **Deployments** → newest one → **⋯** → **Redeploy** → **Redeploy**. Wait until it says **Ready**.

## 3. Create or update the tables (run this now, and again whenever Claude says "the database changed")
1. Supabase → left menu → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project, copy **everything**, paste it, click **Run**.
3. You should see one row: **MAKENDLESS database is ready**.

It is safe to run again: it only adds what is missing and keeps every lead. This version adds the **Notes** column, renames the status "Quote sent" to **Proposal**, and closes direct database access so only the website's server can read or write.

## 4. Allow the password-reset link and switch off public sign-ups
1. Supabase → **Authentication** → **URL Configuration**:
   - **Site URL**: `https://makendless.vercel.app`
   - **Redirect URLs** → **Add URL**: `https://makendless.vercel.app/admin` → **Save**.
2. Supabase → **Authentication** → **Sign In / Providers** (older screens: **Providers → Email**): make sure **Email** is on, then turn **OFF** "Allow new users to sign up" → **Save**. Logins are created only by you (steps 5 and 6).

## 5. Your /admin password (Owner)
1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Email: `makendlessofficial@gmail.com`. Password: a strong one (at least 8 characters). Tick **Auto Confirm User**. Click **Create user**.
3. If it says the user **already exists** (from the old email-link login), skip that: open https://makendless.vercel.app/admin → **Forgot password?** → enter the email → open the email on the same device → choose your password.
4. Log in at https://makendless.vercel.app/admin with that email and password.
5. To change it later: /admin → **Change my password** (under the tabs).

## 6. Team members (optional)
/admin → **Settings** → **+ Add member** → email, name, role, and a **login password** → **Save member**. Send them the password privately (WhatsApp).
To reset a member's password: open the member → **Set a new login password**. To remove access: untick **Active**.
A Team member sees only the leads and projects assigned to them, without prices.

## 7. Email alerts for new leads: Resend (free, optional)
1. Open https://resend.com → **Sign up** with **makendlessofficial@gmail.com** (on the free plan Resend only sends to the email you signed up with).
2. **API Keys** → **Create API Key** → name `makendless` → **Sending access** → **Add**. Copy the key (starts with `re_`) into Vercel as `RESEND_API_KEY` (step 2), then redeploy.

## 8. Turn on the chatbot: Claude API key
1. Open https://console.anthropic.com → sign up / log in with **makendlessofficial@gmail.com**.
2. **Plans & Billing** (Settings → Billing) → add a payment method and buy a small amount of credit (for example $5). The chatbot uses the cheap Haiku model: replies are short (at most 400 tokens), so $5 lasts thousands of messages.
3. Optional but smart: **Settings → Limits** → set a monthly spend limit (for example $10) so it can never cost more.
4. **API Keys** → **Create Key** → name `makendless-website` → **Add**. Copy the key (starts with `sk-ant-`). It is shown only once.
5. Vercel → **makendless-startup** → **Settings** → **Environment Variables** → Name `ANTHROPIC_API_KEY`, Value: the key. Tick **Production** and **Preview**. **Save**.
6. **Deployments** → newest → **⋯** → **Redeploy**. Wait for **Ready**.
7. Open https://makendless.vercel.app → round chat button (bottom right, above WhatsApp) → tap **Pricing**. You should get a short answer with real prices.

Without the key the chat still opens, but says the assistant is offline and points visitors to WhatsApp. The key lives only in Vercel: the browser never sees it.

## 9. Check it works
1. Open https://makendless.vercel.app/contact, fill in the form with your own number, press **Review my brief**, then **Start a Project**. You should see "Thanks, …".
2. Open https://makendless.vercel.app/admin → log in → **Leads**: the test lead is at the top with Source **Form**.
3. Change its **Status** in the table and type a **note**; reload the page: both stay.
4. Delete the test lead (open it → **Delete lead**).
5. Chatbot: tell it "I want a website", give a name and your number; the lead appears with Source **Chatbot**. Delete it after.
6. Tell Claude "it's set up" to run the final checks.

## Change details later
- Email, WhatsApp number, links: `data/owner.ts`, or /admin → Settings.
- Prices, packs, FAQ, work samples, reviews: /admin → **Website** (no code needed).
- Referral reward and minimum: /admin → Settings.
