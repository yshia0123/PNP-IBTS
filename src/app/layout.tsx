import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuthGate } from "@/components/layout/auth-gate";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PNP IBTS — Integrated Benefits Tracking System",
  description:
    "Frontend prototype for tracking officer benefits, claims, and personnel records.",
  icons: {
    icon: "/pnp-logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" className={`${inter.variable}`}>
      <body className="antialiased">
        <Providers>
          <AuthGate>{children}</AuthGate>
        </Providers>
      </body>
    </html>
  );
}
