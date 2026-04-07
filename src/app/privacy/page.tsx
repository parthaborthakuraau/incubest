import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Incubest",
  description: "Privacy Policy for Incubest — The OS for Incubators",
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: April 7, 2026</p>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                Incubest (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website <strong>incubest.com</strong> and provides a SaaS platform for incubator and startup management. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <p className="mb-3">We collect information that you provide directly to us:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password, organization name, city, and state when you register.</li>
                <li><strong>Profile Information:</strong> Organization logo, description, contact details, and other profile data you choose to provide.</li>
                <li><strong>Startup Data:</strong> Company details, DPIIT number, CIN, PAN, funding information, team details, milestones, and reports submitted through the platform.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our platform, including pages visited, features used, and session duration.</li>
                <li><strong>Communications:</strong> Messages sent through our AI chat feature and any correspondence with our support team.</li>
                <li><strong>Google Account Data:</strong> If you sign in with Google, we receive your name, email address, and profile picture from Google. We do not access your Google Drive, Calendar, or other Google services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide, maintain, and improve our platform and services.</li>
                <li>To create and manage your account.</li>
                <li>To process and manage incubator programs, cohorts, and startup tracking.</li>
                <li>To generate reports, analytics, and AI-powered insights for your organization.</li>
                <li>To facilitate the Startup Passport system and cross-incubator verification.</li>
                <li>To enable the marketplace for sharing incubator facilities and services.</li>
                <li>To send you notifications, updates, and administrative messages.</li>
                <li>To respond to your inquiries and provide customer support.</li>
                <li>To detect, prevent, and address technical issues and security threats.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. AI Chat & Data Processing</h2>
              <p>
                Our platform uses AI (powered by third-party language models) to provide chat assistance and generate insights. When you use the AI chat feature, your messages and relevant portfolio data are sent to our AI service provider for processing. We do not use your data to train AI models. AI-generated responses are for informational purposes and should not be treated as professional advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing & Disclosure</h2>
              <p className="mb-3">We do not sell your personal information. We may share your data in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Startup Passport:</strong> If you opt in, basic startup information (name, sector, incubation status) may be visible to other incubators through the Passport search system.</li>
                <li><strong>Marketplace:</strong> Service listings you create are visible to other organizations on the platform.</li>
                <li><strong>Service Providers:</strong> We use third-party services for hosting (Vercel), database (Neon), AI processing (Groq), and email (Resend). These providers process data on our behalf under strict data processing agreements.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law, regulation, or legal process.</li>
                <li><strong>With Your Consent:</strong> We may share information with your explicit consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
              <p>
                We implement industry-standard security measures including encrypted data transmission (TLS/SSL), secure password hashing (bcrypt), rate limiting, input sanitization, and role-based access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
              <p>
                We retain your data for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data by contacting us. Some data may be retained as required by applicable laws or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and receive a copy of your personal data.</li>
                <li>Correct inaccurate or incomplete data.</li>
                <li>Request deletion of your personal data.</li>
                <li>Object to or restrict processing of your data.</li>
                <li>Data portability — receive your data in a structured, machine-readable format.</li>
                <li>Withdraw consent at any time where processing is based on consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Cookies</h2>
              <p>
                We use essential cookies for authentication and session management. We do not use third-party tracking cookies or advertising cookies. Our platform uses localStorage for UI preferences (e.g., sidebar state, chat history).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Children&apos;s Privacy</h2>
              <p>
                Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected data from a child, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 p-5">
                <p className="font-semibold text-gray-900">Incubest</p>
                <p>Email: <a href="mailto:aau.incubator@gmail.com" className="text-emerald-600 hover:underline">aau.incubator@gmail.com</a></p>
                <p>Guwahati, Assam, India</p>
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
