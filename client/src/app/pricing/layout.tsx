import React from 'react';
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout';

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent flex">
      <Sidebar user={null} />
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <Topbar user={null} />
        <main className="flex-1 p-6 z-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
