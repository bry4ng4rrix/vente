'use client';

import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAllUsers, getAllProducts, getAllOrders } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = useMemo(() => {
    const users = getAllUsers();
    const products = getAllProducts();
    const orders = getAllOrders();

    const vendors = users.filter(u => u.role === 'vendor');
    const clients = users.filter(u => u.role === 'client');
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalUsers: users.length,
      totalVendors: vendors.length,
      totalClients: clients.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
    };
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord Administrateur</h1>
        <p className="text-muted-foreground mt-2">Gestion globale de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalVendors} vendeurs, {stats.totalClients} clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalOrders} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenu total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)}€</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gestion des utilisateurs</CardTitle>
            <CardDescription>Voir, modifier ou supprimer les utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/users">Gérer les utilisateurs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gestion des produits</CardTitle>
            <CardDescription>Voir et gérer tous les produits par vendeur</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/products">Gérer les produits</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Key metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de la plateforme</CardTitle>
          <CardDescription>Vue d&apos;ensemble des métriques principales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Utilisateurs</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">{stats.totalUsers}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Vendeurs:</span>
                  <span className="font-semibold">{stats.totalVendors}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Clients:</span>
                  <span className="font-semibold">{stats.totalClients}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Activité</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Produits listés:</span>
                  <span className="font-semibold">{stats.totalProducts}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Commandes totales:</span>
                  <span className="font-semibold">{stats.totalOrders}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Commandes complétées:</span>
                  <span className="font-semibold">{stats.completedOrders}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">Revenu total généré</p>
                <p className="text-3xl font-bold text-primary">{stats.totalRevenue.toFixed(2)}€</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Moyenne par commande: {stats.completedOrders > 0 ? (stats.totalRevenue / stats.completedOrders).toFixed(2) : '0'}€
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
