import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Incubest | The OS for Indian startup incubators",
  description:
    "AI-powered platform for startup incubators. Manage programs, track startups, generate grantor reports - all in one place. Built for AIM, RKVY, DST, DPIIT, BIRAC programs.",
  keywords: [
    "incubator management",
    "startup incubator software",
    "AIM incubator",
    "RKVY RAFTAAR",
    "DST NIDHI",
    "DPIIT startup",
    "BIRAC BioNEST",
    "incubation management platform",
    "startup passport",
    "grantor reports",
    "Indian startup ecosystem",
    "incubator OS",
  ],
  authors: [{ name: "Foundation of AIC-AAU Incubator (NEATEHUB)" }],
  creator: "Incubest",
  publisher: "Foundation of AIC-AAU Incubator (NEATEHUB)",
  metadataBase: new URL("https://incubest.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Incubest | The OS for Indian startup incubators",
    description:
      "AI-powered platform for startup incubators. Manage programs, track startups, generate grantor reports - all in one place.",
    url: "https://incubest.com",
    siteName: "Incubest",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Incubest | The OS for Indian startup incubators",
    description:
      "AI-powered platform for startup incubators. Manage programs, track startups, generate grantor reports - all in one place.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: { icon: "/dark.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YWCLDZ7G53"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YWCLDZ7G53');
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
