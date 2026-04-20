'use client';

import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getProductsByVendor, getOrdersByVendor } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VendorDashboard() {
  const { user } = useAuth();

  const products = useMemo(() => {
    if (!user) return [];
    return getProductsByVendor(user.id);
  }, [user]);

  const orders = useMemo(() => {
    if (!user) return [];
    return getOrdersByVendor(user.id);
  }, [user]);

  const stats = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      inStockCount: products.filter(p => p.stock > 0).length,
    };
  }, [products, orders]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">Bienvenue, {user.storeName}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.inStockCount} en stock
            </p>
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
              complétées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground mt-1">
              total généré
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              commandes reçues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(user.badges?.length || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              débloqués
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Store info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de votre magasin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Nom du magasin</p>
            <p className="text-lg">{user.storeName}</p>
          </div>
          {user.storeDescription && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Description</p>
              <p>{user.storeDescription}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Ventes totales</p>
              <p className="text-2xl font-bold">{user.totalSales || 0}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Revenu total</p>
              <p className="text-2xl font-bold text-primary">{(user.totalRevenue || 0).toFixed(2)}€</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gestion des produits</CardTitle>
            <CardDescription>Ajoutez, modifiez ou supprimez vos produits</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/vendor/products">Gérer les produits</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventes et promotions</CardTitle>
            <CardDescription>Consultez vos commandes et promotions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/vendor/sales">Voir les ventes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
            <CardDescription>Vos dernières commandes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orders.slice(0, 5).sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">Commande #{order.id.slice(-6)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <p className="font-semibold">{order.totalAmount.toFixed(2)}€</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
