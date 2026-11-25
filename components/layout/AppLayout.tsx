"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import Header from "./Header";
import Footer from "./Footer";
import { ToastProvider } from "../ui/ToastProvider";

function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  return (
    <>
      {!isAuthPage && <Header />}

      <main className="flex-1">
        {children}
      </main>

      {!isAuthPage && <Footer />}
    </>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <LayoutContent>{children}</LayoutContent>
      </Suspense>
    </ToastProvider>
  );
}
