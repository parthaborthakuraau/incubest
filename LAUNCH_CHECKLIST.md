# Incubest — Launch Checklist

## Priority 1: Security Fixes ✅
- [x] Remove GROQ API key from .env.example
- [x] Add rate limiting to AI/auth APIs (chat: 20/min, insights: 5/min, register: 5/hr)
- [x] Input sanitization utility (sanitize.ts)
- [x] React error boundary wrapping dashboard
- [x] Environment variable audit (.env.example updated with all required vars)

## Priority 2: Google OAuth ✅
- [x] Google provider added to NextAuth (conditional — works when env vars set)
- [x] Google sign-in button on login page
- [x] Needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env to activate

## Priority 3: Landing Page ✅
- [x] Hero section with gradient text + CTA
- [x] Social proof bar (AIM, RKVY, DST, DPIIT, etc.)
- [x] 9 feature cards with icons and descriptions
- [x] How it Works (3 steps)
- [x] For Startups section with passport preview
- [x] Pricing (Free Trial + Pro ₹199/startup/month)
- [x] CTA section
- [x] Footer
- [x] Mobile responsive
- [x] Sticky nav with blur

## Priority 4: Super Admin Dashboard ✅
- [x] SUPER_ADMIN role added to UserRole enum
- [x] /admin page with platform-wide stats
- [x] 8 KPI cards (orgs, users, startups, programs, reports, mentors, forms, services)
- [x] Organizations list with counts
- [x] Recent users list with role badges
- [x] Protected by SUPER_ADMIN role check

## Priority 5: Razorpay Integration ✅ (Schema + Stubs)
- [x] Subscription model (status, plan, razorpay IDs, trial dates)
- [x] SubscriptionStatus enum (TRIAL, ACTIVE, PAST_DUE, CANCELLED, EXPIRED)
- [x] /api/billing GET (subscription status + startup count + estimated monthly)
- [x] /api/billing POST (checkout stub — needs RAZORPAY_KEY_ID to activate)
- [x] Auto-create trial subscription on org registration (14 days)
- [ ] Wire Razorpay SDK when keys are available
- [ ] Webhook for payment status updates
- [ ] Read-only mode on expired subscription
- [ ] Billing page in settings

## Priority 6: Deployment
- [ ] Deploy to Vercel
- [ ] Custom domain setup
- [ ] Wire Razorpay with live keys
- [ ] Wire Resend with domain
- [ ] Set Google OAuth credentials
- [ ] Create SUPER_ADMIN user in production DB
- [ ] Analytics (Posthog/Plausible)

## Feature Polish (Post-Launch)
- [ ] QR code on passport
- [ ] Startup self-signup (/register/startup)
- [ ] Program-scoped events
- [ ] Mentor session scheduling with calendar
- [ ] Infrastructure auto-list as services
- [ ] Report template customization UI
- [ ] Email notifications via Resend
- [ ] AI chart rendering in chat
