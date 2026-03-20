'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from "./components/Sidebar";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === '/panel') {
      setIsAuthenticated(true);
      return;
    }

    const token = sessionStorage.getItem('panel_token');
    const adminToken = process.env.NEXT_PUBLIC_ADMIN_PANEL_TOKEN;

    if (!token || token !== adminToken) {
      sessionStorage.removeItem('panel_token');
      router.push('/panel');
      return;
    }

    setIsAuthenticated(true);
  }, [pathname, router]);

  if (isAuthenticated === false) {
    return null;
  }

  if (pathname === '/panel') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen transition-all duration-300">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
