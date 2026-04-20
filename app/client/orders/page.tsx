'use client';

import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getOrdersByClient, getProductById, getUserById } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrdersPage() {
  const { user } = useAuth();
  const orders = useMemo(() => {
    if (!user) return [];
    return getOrdersByClient(user.id);
  }, [user]);

  if (!user) return null;

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }, [orders]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mes commandes</h1>
        <p className="text-muted-foreground mt-2">
          Historique de vos commandes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dépensé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSpent.toFixed(2)}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {orders.reduce((sum, order) => sum + order.items.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center space-y-4">
            <p className="text-muted-foreground">Vous n&apos;avez pas encore de commandes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => {
            const vendor = getUserById(order.vendorId);
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Commande #{order.id.slice(-8)}
                      </CardTitle>
                      <CardDescription>
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        {order.totalAmount.toFixed(2)}€
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {order.status === 'completed' ? 'Complétée' : 'En attente'}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded">
                    <p className="text-sm font-medium">Vendeur: {vendor?.storeName}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Articles:</p>
                    {order.items.map((item) => {
                      const product = getProductById(item.productId);
                      return (
                        <div key={item.productId} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                          <div>
                            <p className="font-medium">{product?.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity}x {item.price.toFixed(2)}€
                            </p>
                          </div>
                          <p className="font-semibold">
                            {(item.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
