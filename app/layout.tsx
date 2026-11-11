import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foodie",
  description: "Discover delicious food and order your favourite meals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}