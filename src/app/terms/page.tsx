import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Incubest",
  description: "Terms of Service for Incubest - The OS for Incubators",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/dark.svg" alt="Incubest" className="h-8 w-8 rounded-xl" />
            <span className="text-lg font-bold text-gray-900">Incubest</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: April 7, 2026</p>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Incubest (&quot;the Platform&quot;), operated by Foundation of AIC-AAU Incubator (NEATEHUB) (CIN: U74999AS2018NPL018729) (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Platform. These terms apply to all users, including incubator administrators, team members, startup founders, mentors, and grantors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p>
                Incubest is a SaaS platform that provides incubator management tools including program management, cohort tracking, startup portfolio management, AI-powered insights, report generation, Startup Passport system, marketplace for incubator services, and related features. The Platform is designed to serve the Indian startup incubation ecosystem.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Registration</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate, complete, and current information during registration.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You are responsible for all activities that occur under your account.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
                <li>You must be at least 18 years old to create an account.</li>
                <li>One person or organization may not maintain multiple accounts for the same purpose.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Subscription & Billing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>The Platform offers a free tier and paid subscription plans.</li>
                <li>New accounts receive a 14-day free trial of premium features.</li>
                <li>Paid subscriptions are billed on a per-startup, per-month basis as displayed on our pricing page.</li>
                <li>All prices are listed in Indian Rupees (INR) and are exclusive of applicable taxes unless stated otherwise.</li>
                <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.</li>
                <li>We reserve the right to modify pricing with 30 days&apos; prior notice.</li>
                <li>Refunds are handled on a case-by-case basis at our discretion.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Acceptable Use</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Platform for any unlawful purpose or in violation of any applicable laws.</li>
                <li>Upload false, misleading, or fraudulent information about startups or organizations.</li>
                <li>Attempt to gain unauthorized access to other users&apos; accounts or data.</li>
                <li>Interfere with or disrupt the Platform&apos;s infrastructure or other users&apos; use.</li>
                <li>Use automated scripts, bots, or scrapers to access the Platform without our consent.</li>
                <li>Reverse engineer, decompile, or attempt to extract the source code of the Platform.</li>
                <li>Use the AI chat feature to generate harmful, abusive, or illegal content.</li>
                <li>Share your account credentials with unauthorized third parties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Ownership & Intellectual Property</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Your Data:</strong> You retain all ownership rights to the data you upload to the Platform. We do not claim ownership of your content, reports, or startup information.</li>
                <li><strong>Our Platform:</strong> The Platform, including its design, code, features, and branding, is owned by Incubest and protected by intellectual property laws.</li>
                <li><strong>License to Us:</strong> By uploading data, you grant us a limited, non-exclusive license to process, store, and display your data solely for the purpose of providing the Platform&apos;s services to you.</li>
                <li><strong>AI-Generated Content:</strong> Insights and responses generated by our AI features are provided as-is and do not constitute professional advice.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Startup Passport & Marketplace</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>The Startup Passport system enables cross-incubator visibility. By using this feature, you consent to sharing basic startup information with other registered incubators.</li>
                <li>Marketplace listings are visible to all registered organizations. You are responsible for the accuracy of your service listings.</li>
                <li>Incubest is not a party to any transactions facilitated through the marketplace and does not guarantee the quality of services listed.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Team Access & Permissions</h2>
              <p>
                Organization administrators are responsible for managing team member access and permissions. Administrators may invite team members and assign roles. The administrator is responsible for the actions taken by team members on the Platform under their organization&apos;s account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Availability & Modifications</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We strive to maintain Platform availability but do not guarantee uninterrupted access.</li>
                <li>We may modify, suspend, or discontinue any feature of the Platform at any time.</li>
                <li>We will provide reasonable notice before making material changes that affect your use.</li>
                <li>Scheduled maintenance windows will be communicated in advance when possible.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, Incubest shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of profits, or business interruption, arising from your use of the Platform. Our total liability for any claims arising from these terms shall not exceed the amount you paid to us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Incubest, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Platform, violation of these terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Termination</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may terminate your account at any time by contacting us.</li>
                <li>We may suspend or terminate your account for violation of these terms, with or without notice.</li>
                <li>Upon termination, your right to use the Platform ceases immediately.</li>
                <li>We will provide a reasonable window to export your data before permanent deletion.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Governing Law & Disputes</h2>
              <p>
                These terms are governed by the laws of India. Any disputes arising from these terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts in Jorhat, Assam, India.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Changes to These Terms</h2>
              <p>
                We may update these Terms of Service from time to time. We will notify you of material changes by posting the updated terms on this page and updating the &quot;Last updated&quot; date. Continued use of the Platform after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 p-5">
                <p className="font-semibold text-gray-900">Foundation of AIC-AAU Incubator (NEATEHUB)</p>
                <p className="text-sm text-gray-500 mt-1">CIN: U74999AS2018NPL018729</p>
                <p className="mt-2">North East Agriculture Technology Entrepreneurs Hub (NEATEHUB)</p>
                <p>Assam Agricultural University, Jorhat - 785013, Assam, India</p>
                <p className="mt-2">Email: <a href="mailto:aau.incubator@gmail.com" className="text-emerald-600 hover:underline">aau.incubator@gmail.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/dark.svg" alt="Incubest" className="h-6 w-6 rounded-lg" />
            <span className="text-sm font-bold text-gray-900">Incubest</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
            <a href="mailto:aau.incubator@gmail.com" className="hover:text-gray-700">Contact</a>
          </div>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Incubest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
