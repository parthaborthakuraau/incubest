import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
      <body style={{ fontFamily: "'Geist', 'Helvetica Neue', sans-serif" }}>{children}</body>
    </html>
  );
}
