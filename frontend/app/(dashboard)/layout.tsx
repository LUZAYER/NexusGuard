'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { AppShell } from '@/components/layout/AppShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppShell onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="w-full max-w-7xl mx-auto px-6 py-7 sm:px-8 md:px-10 lg:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
