import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Incubest | The OS for Indian startup incubators",
  description:
    "AI-powered platform for startup incubators. Manage programs, track startups, generate grantor reports - all in one place.",
  icons: { icon: "/dark.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
