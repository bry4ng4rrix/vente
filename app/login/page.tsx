'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    if (success) {
      router.push('/');
    } else {
      setError('Email ou mot de passe incorrect');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">MarketHub</h1>
          <p className="text-muted-foreground">Plateforme E-Commerce</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Connectez-vous à votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm">
              <p className="text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  S&apos;inscrire
                </Link>
              </p>
            </div>

            <div className="mt-6 space-y-3 border-t pt-6">
              <p className="text-xs text-muted-foreground font-medium">Comptes de test:</p>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-slate-50 rounded">
                  <p><strong>Client:</strong> client@example.com</p>
                  <p>Mot de passe: password123</p>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <p><strong>Vendeur 1:</strong> vendor1@example.com</p>
                  <p>Mot de passe: password123</p>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <p><strong>Vendeur 2:</strong> vendor2@example.com</p>
                  <p>Mot de passe: password123</p>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <p><strong>Admin:</strong> admin@example.com</p>
                  <p>Mot de passe: password123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
