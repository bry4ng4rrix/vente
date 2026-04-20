'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getOrdersByVendor, getProductsByVendor, saveProduct, getProductById } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VendorSalesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(getOrdersByVendor(user?.id || ''));
  const [products, setProducts] = useState(getProductsByVendor(user?.id || ''));
  const [activeTab, setActiveTab] = useState('sales');
  const [promotionForm, setPromotionForm] = useState({
    productId: '',
    discountPercent: '',
  });

  if (!user) return null;

  const stats = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      totalItems,
      averageOrder: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
    };
  }, [orders]);

  const handleAddPromotion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!promotionForm.productId || !promotionForm.discountPercent) {
      alert('Veuillez sélectionner un produit et un pourcentage');
      return;
    }

    const product = products.find(p => p.id === promotionForm.productId);
    if (product) {
      const updatedProduct = {
        ...product,
        promotion: {
          type: 'percentage' as const,
          discountPercent: parseInt(promotionForm.discountPercent),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
      saveProduct(updatedProduct);
      setProducts(getProductsByVendor(user.id));
      setPromotionForm({
        productId: '',
        discountPercent: '',
      });
      alert('Promotion ajoutée !');
    }
  };

  const handleRemovePromotion = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const updatedProduct = {
        ...product,
        promotion: undefined,
      };
      saveProduct(updatedProduct);
      setProducts(getProductsByVendor(user.id));
    }
  };

  const handleBadgeCheck = (vendorId: string) => {
    const badges = [];
    const vendorOrders = orders.filter(o => o.status === 'completed');
    
    if (vendorOrders.length >= 1) badges.push('first-sale');
    if (vendorOrders.length >= 10) badges.push('confirmed-seller');
    if (vendorOrders.length >= 50) badges.push('expert-seller');
    if (stats.totalRevenue >= 500) badges.push('entrepreneur');
    if (products.length >= 5) badges.push('cataloguer');
    if (products.filter(p => p.promotion).length >= 3) badges.push('promotion-master');

    return badges;
  };

  const unlockedBadges = handleBadgeCheck(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Ventes et Promotions</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos ventes, promotions et badges
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              Articles vendus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalItems}</div>
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moyenne/commande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageOrder.toFixed(2)}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unlockedBadges.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              débloqués
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Commandes</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="gamification">Badges</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-muted-foreground">Aucune commande pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            Commande #{order.id.slice(-6)}
                          </CardTitle>
                          <CardDescription>
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">
                            {order.totalAmount.toFixed(2)}€
                          </div>
                          <div className="text-xs capitalize">
                            {order.status === 'completed' ? 'Complétée' : 'En attente'}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        <span className="font-medium">{order.items.length}</span> article(s)
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ajouter une promotion</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPromotion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Produit</label>
                    <select
                      value={promotionForm.productId}
                      onChange={(e) => setPromotionForm({...promotionForm, productId: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Réduction (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={promotionForm.discountPercent}
                      onChange={(e) => setPromotionForm({...promotionForm, discountPercent: e.target.value})}
                      placeholder="10"
                    />
                  </div>
                </div>

                <Button type="submit">Ajouter la promotion</Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Promotions */}
          <Card>
            <CardHeader>
              <CardTitle>Promotions actives</CardTitle>
            </CardHeader>
            <CardContent>
              {products.filter(p => p.promotion).length === 0 ? (
                <p className="text-muted-foreground">Aucune promotion pour le moment</p>
              ) : (
                <div className="space-y-2">
                  {products.filter(p => p.promotion).map(product => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                      <div>
                        <p className="font-medium text-sm">{product.title}</p>
                        <p className="text-sm text-red-600">
                          -{product.promotion!.discountPercent}% (Sauve {(product.price * product.promotion!.discountPercent / 100).toFixed(2)}€)
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemovePromotion(product.id)}
                      >
                        Retirer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gamification Tab */}
        <TabsContent value="gamification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Badges et récompenses</CardTitle>
              <CardDescription>Débloquez des badges en atteignant vos objectifs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Badge: First Sale */}
                <div className={`p-4 rounded-lg border-2 ${unlockedBadges.includes('first-sale') ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 opacity-50'}`}>
                  <h3 className="font-bold text-lg">🎉 Première Vente</h3>
                  <p className="text-sm text-muted-foreground">Effectuez votre première vente</p>
                  {unlockedBadges.includes('first-sale') && (
                    <p className="text-xs text-green-600 mt-1">✓ Débloqué</p>
                  )}
                </div>

                {/* Badge: Confirmed Seller */}
                <div className={`p-4 rounded-lg border-2 ${unlockedBadges.includes('confirmed-seller') ? 'border-blue-500 bg-blue-50' : 'border-gray-200 opacity-50'}`}>
                  <h3 className="font-bold text-lg">⭐ Vendeur Confirmé</h3>
                  <p className="text-sm text-muted-foreground">10 ventes complétées</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.completedOrders}/10 ventes</p>
                  {unlockedBadges.includes('confirmed-seller') && (
                    <p className="text-xs text-green-600 mt-1">✓ Débloqué</p>
                  )}
                </div>

                {/* Badge: Expert Seller */}
                <div className={`p-4 rounded-lg border-2 ${unlockedBadges.includes('expert-seller') ? 'border-purple-500 bg-purple-50' : 'border-gray-200 opacity-50'}`}>
                  <h3 className="font-bold text-lg">👑 Expert Vendeur</h3>
                  <p className="text-sm text-muted-foreground">50 ventes complétées</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.completedOrders}/50 ventes</p>
                  {unlockedBadges.includes('expert-seller') && (
                    <p className="text-xs text-green-600 mt-1">✓ Débloqué</p>
                  )}
                </div>

                {/* Badge: Entrepreneur */}
                <div className={`p-4 rounded-lg border-2 ${unlockedBadges.includes('entrepreneur') ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-50'}`}>
                  <h3 className="font-bold text-lg">💰 Entrepreneur</h3>
                  <p className="text-sm text-muted-foreground">500€ de revenu généré</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.totalRevenue.toFixed(2)}€/500€</p>
                  {unlockedBadges.includes('entrepreneur') && (
                    <p className="text-xs text-green-600 mt-1">✓ Débloqué</p>
                  )}
                </div>

                {/* Badge: Cataloguer */}
                <div className={`p-4 rounded-lg border-2 ${unlockedBadges.includes('cataloguer') ? 'border-orange-500 bg-orange-50' : 'border-gray-200 opacity-50'}`}>
                  <h3 className="font-bold text-lg">📚 Catalogueur</h3>
                  <p className="text-sm text-muted-foreground">5 produits créés</p>
                  <p className="text-xs text-gray-500 mt-1">{products.length}/5 produits</p>
                  {unlockedBadges.includes('cataloguer') && (
                    <p className="text-xs text-green-600 mt-1">✓ Débloqué</p>
                  )}
                </div>

                {/* Badge: Promotion Master */}
                <div className={`p-4 rounded-lg border-2 ${unlockedBadges.includes('promotion-master') ? 'border-red-500 bg-red-50' : 'border-gray-200 opacity-50'}`}>
                  <h3 className="font-bold text-lg">🎁 Maître des Promotions</h3>
                  <p className="text-sm text-muted-foreground">3 promotions actives</p>
                  <p className="text-xs text-gray-500 mt-1">{products.filter(p => p.promotion).length}/3 promotions</p>
                  {unlockedBadges.includes('promotion-master') && (
                    <p className="text-xs text-green-600 mt-1">✓ Débloqué</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
