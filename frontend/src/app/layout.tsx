import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Absher Neuron 2.0 — AI Security Intelligence Platform",
    template: "%s · Absher Neuron",
  },
  description:
    "Next-generation national digital identity and predictive security platform. Behavioral identity intelligence, predictive threat detection and adaptive verification. By Abdulaziz AlAmawi.",
  applicationName: "Absher Neuron",
  authors: [{ name: "Abdulaziz AlAmawi" }],
  creator: "Abdulaziz AlAmawi",
  publisher: "Abdulaziz AlAmawi",
  keywords: [
    "AI Security", "Identity Intelligence", "Behavioral Analytics",
    "Threat Detection", "Zero Trust", "Adaptive MFA", "SDAIA", "Absher",
  ],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} dark`}>
      <body className="bg-command min-h-screen antialiased">{children}</body>
    </html>
  );
}
