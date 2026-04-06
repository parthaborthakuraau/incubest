# Incubest — Development Progress

## What is Incubest
A SaaS platform for Indian startup incubators — replaces spreadsheets/WhatsApp for incubator-startup management. Built with Next.js 16 (App Router, Turbopack), Prisma ORM, PostgreSQL (Neon), NextAuth v5, Tailwind CSS v4, shadcn/ui components.

## Architecture
- **Auth**: NextAuth v5 with Credentials provider, JWT strategy, PrismaAdapter
- **Roles**: INCUBATOR_ADMIN, STARTUP_FOUNDER, MENTOR, GRANTOR
- **Data hierarchy**: Startup → Cohort → Organization
- **DB**: Neon serverless PostgreSQL with `connect_timeout=30` to handle cold starts

---

## Phase 1: Core Pages (Complete)

Built the 4 missing pages that were linked in sidebar but had no implementation:

- **Startup Profile** (`/startup/profile`) — View/edit startup details with diversity tags (founderGender, founderCategory, isWomenLed, isRural)
- **Startup Documents** (`/startup/documents`) — Document management with URL links, type badges
- **Startup Funding** (`/startup/funding`) — Funding overview with stat cards, fund list with status badges
- **Incubator Mentors** (`/incubator/mentors`) — Mentor list with add form, sessions tab, expertise badges

---

## Phase 2: 9 Major Features (Complete)

### Incubator Side
1. **Infrastructure** (`/incubator/infrastructure`) — Space management (labs, desks, meeting rooms) and allocation to startups
2. **Grantor Reports** (`/incubator/grantor-reports`) — Custom template builder + automated report generation with data aggregation from all startups
3. **Events** (`/incubator/events`) — Event management with attendance tracking
4. **Social Impact** (`/incubator/impact`) — Cumulative social impact dashboard across portfolio
5. **Alumni Tracking** (`/incubator/alumni`) — Alumni status management with inline editing, post-graduation metrics
6. **Jobs** (`/incubator/jobs`) — Job category management + aggregate job creation stats

### Startup Side
7. **IP & Patents** (`/startup/ip`) — IP tracking with status pipeline (DRAFT → FILED → PUBLISHED → GRANTED)
8. **Jobs Created** (`/startup/jobs`) — Job reporting per custom category defined by incubator
9. **Social Impact** (`/startup/impact`) — Social impact logging (beneficiaries, revenue from women, rural impact, etc.)
10. **Health Score** (`/startup/health`) — Computed health score (7 metrics, 100 points) with breakdown
11. **Events** (`/startup/events`) — Event attendance view
12. **Workspace** (`/startup/infrastructure`) — Allocated workspace view

### Schema Additions (Phase 2)
- Space, SpaceAllocation — infrastructure management
- Event, EventAttendance — event tracking
- IntellectualProperty — IP/patent pipeline
- JobCategory, JobRecord — employment tracking
- SocialImpact — social metrics
- GrantorReport — custom reporting
- Startup model extended with diversity fields + alumni fields

---

## Phase 3: Depth & Polish (Complete)

### 1. Report Review + Feedback Flow
- **API**: PATCH endpoint in `/api/reports` — incubator admin can mark reports as REVIEWED with optional feedback notes
- **Incubator side** (`/incubator/reports`): Rewritten as client component with expandable report details, review textarea + "Mark as Reviewed" button, current month stats (submitted/pending/reviewed)
- **Startup side** (`/startup/reports`): Reports now expandable with `<details>` element showing all submitted data. Green feedback card appears when incubator has reviewed with notes

### 2. Auto-Sync Report Data to Startup Metrics
- When a startup submits a monthly report, their startup record auto-updates: revenue, employeesCount, customersCount, funding
- This keeps dashboard stats accurate without manual data entry

### 3. Incubator Dashboard Overhaul (`/incubator`)
- **Stat cards**: Total Startups, Active Cohorts, Portfolio Revenue, Reporting Rate, Jobs Created, Total Funding, Pending Reviews
- **"Not Reported" card**: Highlights startups that haven't submitted for the current month (yellow warning cards)
- **"Pending Reviews" card**: Shows reports awaiting incubator review
- **Startups table**: Now includes Revenue column
- Reporting rate shows month name and fraction

### 4. Mentor Session Logging
- **API**: POST endpoint at `/api/mentors/sessions` — creates session with mentor, startup, date, duration, notes, action items
- **UI**: "Log Session" button in Sessions tab with form (mentor dropdown, startup dropdown, date, duration, notes, action items)

### 5. Sidebar Fixes
- Added missing **Events** and **Workspace** (Infrastructure) links to the startup sidebar

### 6. CSV Export
- **API**: GET `/api/reports/export` — generates CSV with all reports, dynamic columns from report data JSON, proper escaping
- **UI**: "Export CSV" button on incubator reports page

---

## Bug Fixes (All Resolved)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Missing DATABASE_URL | No .env file | Created .env with Neon connection string |
| Prisma generate EPERM | OneDrive locked query engine DLL | Kill all node processes first |
| Multi-step invite form losing data | Step 1 fields removed from DOM on step 2 | Use CSS `hidden` class instead of conditional rendering |
| Email already registered on invite | Previous failed attempt created user | Delete user, reset invite to PENDING |
| Startup founder redirect loop | Login hardcoded to `/incubator` | Fetch session after login, route by role |
| Report submission 500 | No ReportTemplate existed, FK constraint | Auto-create default template on first submission |
| Neon cold start timeouts | Serverless DB waking up | Added `connect_timeout=30` to DATABASE_URL |
| 404 on startup detail page | Page didn't exist | Created `/incubator/startups/[id]/page.tsx` |
| Reports not expandable | No expand/collapse UI | Added `<details>` HTML element |
| IP route type error | Wrong query path for organizationId | Fixed to `startup.cohort.organizationId` |

---

## API Routes Summary

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/register` | POST | Register incubator org + admin |
| `/api/auth/accept-invite` | POST | Startup accepts invite, creates account |
| `/api/cohorts` | GET, POST | Cohort CRUD |
| `/api/invites` | GET, POST | Invite management |
| `/api/startups` | GET, PATCH | Startup list + profile update |
| `/api/reports` | GET, POST, PATCH | Report submit + review |
| `/api/reports/export` | GET | CSV export |
| `/api/report-templates` | GET, POST | Custom report templates |
| `/api/documents` | GET, POST, DELETE | Startup documents |
| `/api/mentors` | GET, POST | Mentor management |
| `/api/mentors/sessions` | GET, POST | Mentor session logging |
| `/api/events` | GET, POST, DELETE | Event CRUD |
| `/api/events/attendance` | GET, POST | Attendance tracking |
| `/api/infrastructure` | GET, POST, DELETE | Space management |
| `/api/infrastructure/allocations` | GET, POST, DELETE | Space allocation |
| `/api/ip` | GET, POST, PATCH | IP/patent tracking |
| `/api/jobs` | GET, POST | Job records |
| `/api/jobs/categories` | GET, POST | Job categories |
| `/api/social-impact` | GET, POST | Social impact metrics |
| `/api/alumni` | GET, PATCH | Alumni status |
| `/api/health-score` | GET | Computed health score |
| `/api/grantor-reports` | GET, POST | Grantor report generation |
| `/api/chat` | POST | AI chat |

---

## Phase 4: MVP Completion (Complete)

### 1. Milestone Management
- **API**: `/api/milestones` — GET milestones (role-aware), PATCH status/notes
- **API**: `/api/milestones/templates` — GET, POST, DELETE milestone templates
- **Incubator side** (`/incubator/milestones`): Templates tab (create per cohort, due offset in days, auto-assigns to all startups) + Progress Tracker tab (grouped by template, progress bars, cohort filter)
- **Startup side** (`/startup/milestones`): Stats cards (total/completed/in-progress/overdue), overall progress bar, inline status update dropdowns, notes input
- **Schema**: MilestoneTemplate + Milestone models (already existed, now wired up)
- **Sidebar**: Added Milestones link to both incubator and startup sidebars

### 2. PDF Report Generation
- **API**: `/api/grantor-reports/pdf` — GET with report ID, generates styled PDF using jsPDF + jspdf-autotable
- **PDF contents**: Org header, report title/grantor/period, key metrics table, sector distribution table, stage distribution table, page numbers, Incubest footer
- **UI**: "Download PDF" button on each generated grantor report card

### 3. File Upload Integration
- **API**: `/api/upload` — POST multipart form data, stores to `public/uploads/`, 10MB limit, unique filenames
- **Documents page**: Toggle between "Upload File" (direct upload) and "Paste URL" (existing flow), file size tracking
- **Documents API**: Updated to accept `size` field from uploads

### 4. In-App Notification System
- **Schema**: New `Notification` model (type, title, message, isRead, link, userId)
- **API**: `/api/notifications` — GET (with unread count), PATCH (mark read / mark all read)
- **API**: `/api/notifications/send-reminders` — POST sends report reminders to all startups that haven't reported this month
- **UI**: NotificationBell component in dashboard header — badge with unread count, dropdown panel, time-ago display, click-to-navigate, mark read
- **Incubator Dashboard**: "Send Reminders" button on the Not Reported card

### 5. Settings Page
- **API**: `/api/settings` — GET user + org data, PATCH profile/org/password
- **Profile tab**: Edit name, phone, view email + role badge
- **Organization tab** (admin only): Edit name, description, website, city, state, type (TBI/AIC/State/Private/University/Corporate)
- **Password tab**: Change password with current password verification, bcrypt hashing

### New API Routes Added

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/milestones` | GET, PATCH | Milestone list + status update |
| `/api/milestones/templates` | GET, POST, DELETE | Milestone template CRUD |
| `/api/grantor-reports/pdf` | GET | PDF export for grantor reports |
| `/api/upload` | POST | File upload (multipart) |
| `/api/notifications` | GET, PATCH | Notification list + mark read |
| `/api/notifications/send-reminders` | POST | Send report reminders |
| `/api/settings` | GET, PATCH | User/org settings |

---

## Phase 5: Platform Architecture (Complete)

### 1. Multi-Program Architecture
- **Schema**: New `Program` model (type: AIM/RKVY/DST/DPIIT/BIRAC/TIDE/HDFC_PARIVARTAN/STATE_GOVT/CORPORATE/CUSTOM)
- **Hierarchy**: Organization → Program → Cohort → Startup
- **API**: `/api/programs` — GET, POST, PATCH (create, list, toggle active)
- **UI** (`/incubator/programs`): Program management with type selector, grantor, reporting cycle (monthly/quarterly/annual), cohort list per program, startup counts
- **Cohort integration**: Cohorts can now be assigned to a program, program badge shown on cohort cards
- **Default program**: "General Incubation" auto-created on org registration
- **Report templates & milestones**: Can now be scoped to a specific program

### 2. Data Requests (Ad-hoc Asks)
- **Schema**: `DataRequest` (title, fields JSON, deadline, program link) + `DataRequestResponse` (per startup, status, response data)
- **API**: `/api/data-requests` — GET (role-aware), POST (create + auto-notify founders)
- **API**: `/api/data-requests/respond` — PATCH (startup submits response)
- **Incubator side** (`/incubator/data-requests`): Create request with custom fields (text/number/date/textarea), pick specific startups, set deadline, optional program scope. View responses with expandable cards showing submitted data.
- **Startup side** (`/startup/data-requests`): Pending requests with inline response forms, submitted responses history. Yellow banner showing pending count.
- **Auto-notification**: Founders get notified when a new data request is sent

### 3. Cross-Incubator Detection
- **On invite acceptance**: System checks if startup's DPIIT number, CIN, or PAN already exists in another organization
- **Invite form updated**: Registration details (DPIIT, CIN, PAN) collected during onboarding
- **Alert system**: If overlap found, incubator admins get a notification with details (e.g. "XYZ Startup is already incubated at AIC Assam, matched on DPIIT")
- **Response includes flags**: API returns cross-incubator flags to the frontend

### 4. Default Job Categories
- On org registration, 5 default categories are auto-seeded: Full-time, Part-time, Interns, Contract Workers, Freelancers
- Startups can now log jobs immediately without waiting for incubator to set up categories

### 5. GROQ API Key
- Added `GROQ_API_KEY` placeholder to `.env` — user needs to get key from console.groq.com

### New/Updated API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/programs` | GET, POST, PATCH | Program CRUD |
| `/api/data-requests` | GET, POST | Data request management |
| `/api/data-requests/respond` | PATCH | Startup submits response |

---

## What's Next (Potential)

- **Startup Passport** — Global identity page per startup, visible across incubators
- **Email notifications** — Extend notification system with email delivery (Resend/SendGrid, needs domain)
- **Program-specific report templates** — Ship default AIM/DST/RKVY templates out of the box
- **Grantor role** — Read-only dashboard for government/funding body users
- **Mobile responsiveness** — Test and fix layouts on small screens
- **Data visualization** — Charts for revenue trends, reporting compliance, portfolio growth
- **Bulk operations** — Bulk invite, bulk review, bulk export
- **Audit trail** — Log who changed what and when
- **S3 migration** — Move file uploads from local to S3/R2 for production
