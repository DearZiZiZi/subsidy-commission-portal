"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function ShellLayout({ children }: { children: ReactNode }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--page-bg)]">
      <Sidebar
        mobileOpen={mobileMenu}
        onMobileClose={() => setMobileMenu(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileMenu(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
