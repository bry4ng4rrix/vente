'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAllProducts, getAllUsers, saveProduct, deleteProduct } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState(getAllProducts());
  const [users, setUsers] = useState(getAllUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');

  if (!user) return null;

  const vendors = users.filter(u => u.role === 'vendor');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = !selectedVendor || p.vendorId === selectedVendor;
    return matchesSearch && matchesVendor;
  });

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(productId);
      setProducts(getAllProducts());
    }
  };

  const stats = useMemo(() => {
    return {
      totalProducts: products.length,
      totalByVendor: vendors.map(v => ({
        vendorId: v.id,
        vendorName: v.storeName,
        count: products.filter(p => p.vendorId === v.id).length,
      })),
      categories: Array.from(new Set(products.map(p => p.category))),
      averagePrice: products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : '0',
    };
  }, [products, vendors]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des produits</h1>
        <p className="text-muted-foreground mt-2">
          Voir et gérer tous les produits par vendeur
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catégories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prix moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averagePrice}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendeurs actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalByVendor.filter(v => v.count > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h2 className="font-semibold">Filtrer</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Recherche</label>
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Magasin</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="">Tous les magasins</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.storeName} ({products.filter(p => p.vendorId === vendor.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vendors summary */}
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">Tous les produits ({filteredProducts.length})</TabsTrigger>
          <TabsTrigger value="vendors">Par vendeur</TabsTrigger>
        </TabsList>

        {/* All products tab */}
        <TabsContent value="all" className="space-y-4">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-muted-foreground">Aucun produit trouvé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(product => {
                const vendor = vendors.find(v => v.id === product.vendorId);
                return (
                  <Card key={product.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {product.image && (
                          <div className="w-24 h-24 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">{product.brand}</p>

                          <div className="flex gap-4 mt-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Prix:</span>
                              <span className="ml-1 font-semibold">{product.price.toFixed(2)}€</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stock:</span>
                              <span className="ml-1 font-semibold">{product.stock}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Catégorie:</span>
                              <span className="ml-1 font-semibold">{product.category}</span>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-1">
                            Vendeur: {vendor?.storeName}
                          </p>

                          {product.promotion && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                              <span className="text-red-700">Promotion: -{product.promotion.discountPercent}%</span>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-destructive hover:bg-destructive/10 self-start"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* By vendor tab */}
        <TabsContent value="vendors" className="space-y-4">
          {vendors.map(vendor => {
            const vendorProducts = products.filter(p => p.vendorId === vendor.id);
            return (
              <Card key={vendor.id}>
                <CardHeader>
                  <CardTitle className="text-base">{vendor.storeName}</CardTitle>
                  <CardDescription>
                    {vendorProducts.length} produit{vendorProducts.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {vendorProducts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucun produit</p>
                  ) : (
                    <div className="space-y-2">
                      {vendorProducts.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{product.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.price.toFixed(2)}€ • Stock: {product.stock}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            Supprimer
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
