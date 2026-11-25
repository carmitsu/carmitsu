'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    pathname === '/panel' ? true : null
  );

  useEffect(() => {
    if (pathname === '/panel') {
      setIsAuthenticated(true);
      return;
    }

    let cancelled = false;

    async function verifySession() {
      try {
        const response = await fetch('/api/auth/session', {
          cache: 'no-store',
        });

        if (cancelled) return;

        if (!response.ok) {
          sessionStorage.removeItem('panel_token');
          setIsAuthenticated(false);
          router.replace('/panel');
          return;
        }

        setIsAuthenticated(true);
      } catch {
        if (cancelled) return;
        setIsAuthenticated(false);
        router.replace('/panel');
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (pathname === '/panel') {
    return <>{children}</>;
  }

  if (isAuthenticated !== true) {
    return null;
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
