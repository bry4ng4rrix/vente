'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'client' | 'vendor'>('client');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    if (role === 'vendor' && !storeName.trim()) {
      setError('Veuillez entrer le nom de votre magasin');
      setIsLoading(false);
      return;
    }

    const success = await register(email, password, name, role, storeName);
    if (success) {
      router.push('/');
    } else {
      setError('Cet email est déjà utilisé');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">MarketHub</h1>
          <p className="text-muted-foreground">Créer un compte</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>Rejoignez notre plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nom complet
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                <p className="text-xs text-muted-foreground">
                  Au moins 6 caractères
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Type de compte
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'client' | 'vendor')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="client">Client</option>
                  <option value="vendor">Vendeur</option>
                </select>
              </div>

              {role === 'vendor' && (
                <div className="space-y-2">
                  <label htmlFor="storeName" className="text-sm font-medium">
                    Nom de votre magasin
                  </label>
                  <Input
                    id="storeName"
                    type="text"
                    placeholder="Ma Boutique"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required={role === 'vendor'}
                  />
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Inscription...' : 'S&apos;inscrire'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Vous avez déjà un compte ?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
