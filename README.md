# Incubest — The OS for Incubators

Incubest is an AI-first platform that replaces the spreadsheets, WhatsApp groups, and scattered emails that incubators use to manage startups. It gives incubators a single system to onboard startups, track progress, generate reports, and get instant answers through a chat-first interface.

## The Problem

Incubator operations today are broken:
- Startup progress lives in disconnected spreadsheets — one per startup
- When grantors (AIM, DST, state bodies) ask for numbers, it's chaos
- Data is scattered across folders, emails, and WhatsApp — some is lost entirely
- Startups have no incentive to report monthly because there's nothing in it for them
- Incubators juggle multiple tools with no single source of truth

## The Solution

A unified platform where:
- Incubators onboard startups via invite links — startups fill structured profiles once
- Monthly reporting is simple, incentivized, and AI-assisted
- Any question about any cohort, startup, or metric is answered instantly via chat
- Reports for grantors are generated in one click with pre-built templates
- Hierarchy and reporting chains are built-in (incubator → parent body)

## Two Client Types

| | Incubators | Startups |
|---|---|---|
| **How they join** | Sign up, create org, set up cohorts | Receive invite link from incubator OR sign up independently |
| **Who pays** | Incubator pays ₹199/startup/month | Free tier for independent startups |
| **What they get** | Full management dashboard, AI chat, reports, analytics | Profile, AI insights, mentor access, resources |

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (Supabase) with Prisma ORM v6
- **Authentication**: NextAuth.js v5 (beta) with role-based access (incubator admin, startup founder, mentor, grantor)
- **AI Chat**: Groq API (Llama 3.3 70B) — chat-first interface for querying data
- **UI Components**: Custom components (Button, Input, Card, Badge, StatCard, Sidebar)
- **Deployment**: Vercel (frontend) + Supabase (database)

## Current Build Status — What's Done

### Pages & Routes (20 routes, all building cleanly)

**Public pages:**
- `/` — Landing page with problem statement, chat demo, features, stakeholder benefits, CTA
- `/login` — Credential-based login (email + password)
- `/register` — Incubator admin registration (creates organization + admin user in one step)
- `/invite/[token]` — 2-step startup onboarding flow via invite link (founder details → startup details)

**Incubator dashboard (protected, role: INCUBATOR_ADMIN):**
- `/incubator` — Main dashboard with stat cards (total startups, active cohorts, jobs created, reporting rate), recent reports, startups table
- `/incubator/cohorts` — Create and manage cohorts, card grid view
- `/incubator/cohorts/[id]` — Cohort detail page with startup list, stats, and invite button that generates shareable links
- `/incubator/reports` — View all reports grouped by month, reporting rate visualization per month

**Startup dashboard (protected, role: STARTUP_FOUNDER):**
- `/startup` — Startup dashboard with metrics (employees, revenue, reports, milestones), milestone progress, funding table
- `/startup/reports` — Monthly report submission form (revenue, employees, customers, achievements, challenges, support needed) + report history

**AI Chat (both roles):**
- `/chat` — Full chat interface with suggested prompts. Pulls real data from DB as system context for Groq. Incubator admins get portfolio data; startup founders get advisor mode.

**API Routes:**
- `/api/auth/[...nextauth]` — NextAuth handlers
- `/api/auth/register` — POST: create incubator admin + organization (with slug uniqueness check)
- `/api/auth/accept-invite` — POST: process invite, create startup + founder user, assign to cohort
- `/api/cohorts` — GET/POST: list and create cohorts
- `/api/startups` — GET: list startups (role-aware — incubator sees all, founder sees own)
- `/api/reports` — GET/POST: list and submit monthly reports (upsert by startup+month+year)
- `/api/invites` — GET/POST: list and generate invite links (7-day expiry)
- `/api/chat` — POST: AI chat with Groq, context-aware based on user role

### Database Schema (Prisma, 13 models)

- **User** — roles: INCUBATOR_ADMIN, STARTUP_FOUNDER, MENTOR, GRANTOR
- **Organization** — incubator with hierarchy support (parentOrgId for reporting chains)
- **Cohort** — startup batch within an organization
- **Startup** — structured profile with sector, stage, key metrics, DPIIT info
- **Report** — monthly submissions with JSON data field (flexible schema per template)
- **ReportTemplate** — configurable field definitions per organization
- **Milestone / MilestoneTemplate** — KPIs set by incubator, tracked per startup
- **Mentor / MentorSession** — mentor profiles, session tracking with action items
- **Fund** — grant disbursement tracking (PENDING → DISBURSED → UTILIZED)
- **Document** — file metadata (type: pitch_deck, incorporation_cert, etc.)
- **Invite** — invite tokens with expiry and status tracking
- **ChatThread / ChatMessage** — AI conversation persistence

### Components Built

- `Button` — variants: default, destructive, outline, secondary, ghost, link
- `Input` — with label and error display
- `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent`
- `Badge` — variants: default, secondary, success, warning, destructive, outline
- `StatCard` — dashboard metric card with icon, value, and change indicator
- `Sidebar` — role-aware navigation (different links for incubator vs startup)
- `InviteButton` — inline invite link generation with copy-to-clipboard

### Key Files

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Full database schema (13 models, enums, relations) |
| `src/lib/auth.ts` | NextAuth v5 config with credentials provider, JWT callbacks for role/org/startup |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/utils.ts` | Helpers: cn(), formatCurrency(), formatDate(), slugify(), getMonthName() |
| `src/types/next-auth.d.ts` | TypeScript augmentation for session with role, orgId, startupId |
| `src/app/api/chat/route.ts` | Groq AI chat with role-aware data context injection |

## What's NOT Done Yet (Next Session)

### High Priority
- [ ] **PDF report generation** — export reports as PDF for grantors (AIM, DST, DPIIT templates)
- [ ] **Startup detail page** (`/incubator/startups/[id]`) — deep dive view of individual startup with all reports, milestones, funding
- [ ] **Startup profile edit page** (`/startup/profile`) — founders can update their startup details
- [ ] **Mentor management pages** (`/incubator/mentors`) — list, add, match mentors to startups
- [ ] **Connect to real Supabase DB** — currently builds but hasn't been tested with a live database
- [ ] **Environment setup** — create `.env` with real Supabase URL and Groq key

### Medium Priority
- [ ] **Report review flow** — incubator admin can review and add notes to submitted reports
- [ ] **Document upload** — file upload for startup documents (pitch decks, certs)
- [ ] **Automated reminders** — email/notification nudges for monthly reporting
- [ ] **Startup onboarding improvements** — auto-fill from invite email, better validation
- [ ] **Dashboard charts** — add actual charts/graphs (recharts or similar)
- [ ] **Cohort comparison** — compare metrics across cohorts
- [ ] **Search and filter** — search startups, filter by sector/stage/cohort

### Lower Priority (Post-MVP)
- [ ] Startup Passport system
- [ ] Marketplace for cross-incubator resources
- [ ] Investor Connect pipeline
- [ ] Alumni tracking
- [ ] Gated content and courses
- [ ] Grant/fund alerts
- [ ] WhatsApp Business API integration
- [ ] Polls, quizzes, surveys
- [ ] Public mention tracking

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in: DATABASE_URL (from Supabase), NEXTAUTH_SECRET, GROQ_API_KEY

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run development server
npm run dev
```

## Environment Variables

```env
# Database (Supabase: Settings > Database > Connection string > URI)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

# NextAuth (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Groq AI (console.groq.com > API Keys)
GROQ_API_KEY="gsk_your-key"
```

## Pricing

| Plan | Price | Includes |
|---|---|---|
| **Incubator** | ₹199/startup/month | Full platform access, AI chat, reports, analytics |
| **Startup (via incubator)** | Included | Profile, reporting, AI insights, mentor access |
| **Startup (independent)** | Free (limited) / ₹99/month (full) | Basic profile and AI insights |

Pay-as-you-scale model. No upfront payment. No lock-in.

## License

Proprietary — All rights reserved.
