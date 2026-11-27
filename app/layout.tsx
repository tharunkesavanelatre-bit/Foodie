import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import AppLayout from "@/components/layout/AppLayout";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://foodie-1c4y.vercel.app";
const title = "Foodie | Discover Delicious Food";
const description =
  "Discover delicious food, explore exciting flavours, and find your next favourite meal with Foodie.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Foodie",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Foodie",
    url: "/",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body id="top" className="flex min-h-full flex-col">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}