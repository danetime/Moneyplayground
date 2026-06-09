# 💰 Money Playground

A finance portfolio app that shows your total net worth in **fun, tangible
ways** — piles of gold, diamonds, and the supercars you could buy — plus **how
rich you really are** compared to others in your age bracket, at home and
worldwide.

> For entertainment only. Not financial advice. Prices and wealth figures are
> illustrative.

## Features

- 🔐 **Sign in with Google** (plus a passwordless demo login for local trials)
- 📈 **Add stocks to your portfolio** and track total value
- 🪙 **Visualize your wealth** as gold (oz / kg / bars), diamonds (carats), and cars
- 📊 **Wealth percentile** — see if you're top 25 / 10 / 5 / 1% for your age and country
- 🗄️ **Persistent database** (SQLite for dev, swap to Postgres for production)

## Tech stack

| Layer    | Choice                                   |
| -------- | ---------------------------------------- |
| Framework| Next.js 14 (App Router) + TypeScript     |
| Styling  | Tailwind CSS                             |
| Auth     | NextAuth (Google OAuth + demo login)     |
| Database | Prisma ORM + SQLite (dev)                |
| Prices   | Mock data (`src/lib/stocks.ts`)          |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   - DATABASE_URL is preset to SQLite (file:./dev.db)
#   - Set NEXTAUTH_SECRET (run: openssl rand -base64 32)
#   - ENABLE_DEV_LOGIN=true lets you try the app without Google
#   - (optional) add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET for real Google login

# 3. Create the database schema
npm run db:push

# 4. (optional) Seed a demo portfolio
npm run db:seed

# 5. Run it
npm run dev
```

Open http://localhost:3000. Use the **demo login** (any email) to jump in, or
sign in with Google once configured. If you seeded data, sign in as
`demo@moneyplayground.app` to see the starter portfolio.

## Setting up Google OAuth (optional)

1. Go to the [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth client ID** (type: Web application).
3. Add the authorized redirect URI: `http://localhost:3000/api/auth/callback/google`.
4. Copy the client ID and secret into `.env` and restart.

## Project structure

```
prisma/
  schema.prisma          # User, Account, Session, Holding models
  seed.ts                # demo data
src/
  lib/
    stocks.ts            # mock stock universe + quotes  ← swap for a real API later
    wealth.ts            # net-worth percentile dataset + comparison logic
    visualize.ts         # gold / diamond / car conversions
    auth.ts              # NextAuth config (Google + demo)
    prisma.ts            # Prisma client singleton
    session.ts           # server-side session helpers
  app/
    page.tsx             # landing page
    login/               # sign-in
    dashboard/           # the main experience (server-computed)
    api/
      auth/[...nextauth] # NextAuth handler
      holdings/          # GET/POST + [id] PATCH/DELETE
      profile/           # PATCH birth year & country
  components/            # UI (dashboard widgets, forms)
```

## Going to production

- **Prices:** replace `getQuote`/`getQuotes` in `src/lib/stocks.ts` with a real
  provider (Finnhub, Alpha Vantage, IEX). The rest of the app only depends on
  those two functions.
- **Database:** change the Prisma datasource `provider` to `postgresql` and
  point `DATABASE_URL` at your Postgres instance, then `npm run db:push`.
- **Wealth data:** the figures in `src/lib/wealth.ts` are approximations — swap
  in a vetted dataset for accuracy.
- Set a strong `NEXTAUTH_SECRET`, configure `NEXTAUTH_URL`, and **disable**
  `ENABLE_DEV_LOGIN`.

## Roadmap ideas

- Real-time prices + daily change & charts
- Historical portfolio performance over time
- More asset types (crypto, cash, property) for a true net-worth view
- Shareable "wealth card" images
- More countries and finer-grained wealth data
