'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Package } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Accès non autorisé</p>
          <Button onClick={() => router.push('/login')}>Retour à la connexion</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-bold text-xl">
              MarketHub Admin
            </Link>
            <div className="hidden md:flex gap-4">
              <Link href="/admin" className="text-sm hover:text-primary flex items-center gap-1">
                <Package className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/admin/users" className="text-sm hover:text-primary flex items-center gap-1">
                <Users className="w-4 h-4" />
                Utilisateurs
              </Link>
              <Link href="/admin/products" className="text-sm hover:text-primary flex items-center gap-1">
                <Package className="w-4 h-4" />
                Produits
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
