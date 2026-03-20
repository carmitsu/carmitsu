'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody, CardHeader } from '@nextui-org/react';
import { Lock } from 'lucide-react';

export default function PanelLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setLoading(true);
    
    sessionStorage.setItem('panel_token', token);
    router.push('/panel/realizations');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 pt-8 px-8">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Panel Admina</h1>
          </div>
          <p className="text-small text-foreground-500 px-0.5">
            Wprowadź token dostępowy
          </p>
        </CardHeader>
        <CardBody className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              label="Token"
              placeholder="Wprowadź token dostępowy"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              isRequired
              autoFocus
            />
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={loading}
              isDisabled={!token.trim()}
            >
              Zaloguj się
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
