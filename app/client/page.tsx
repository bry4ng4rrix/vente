'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAllProducts, addToCart, getUserById } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';

export default function ClientHomePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');

  const products = useMemo(() => getAllProducts(), []);
  
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).sort();
  }, [products]);

  const vendors = useMemo(() => {
    const vendorIds = Array.from(new Set(products.map(p => p.vendorId)));
    return vendorIds.map(id => getUserById(id)).filter(Boolean);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesVendor = !selectedVendor || p.vendorId === selectedVendor;
      return matchesSearch && matchesCategory && matchesVendor;
    });
  }, [products, searchTerm, selectedCategory, selectedVendor]);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart({
        productId,
        quantity: 1,
        price: product.price,
      });
      alert('Produit ajouté au panier !');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Bienvenue, {user.name} !</h1>
        <p className="text-muted-foreground">Explorez nos produits et faites vos achats</p>
      </div>

      {/* Filters */}
      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h2 className="font-semibold">Filtrer</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Recherche</label>
          <Input
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
                <option key={vendor?.id} value={vendor?.id}>{vendor?.storeName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Résultats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredProducts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendeurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{vendors.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center space-y-4">
            <p className="text-muted-foreground">
              Aucun produit ne correspond à vos critères de recherche
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedVendor('');
            }}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const vendor = getUserById(product.vendorId);
            const discount = product.promotion ? 
              (product.price * (product.promotion.discountPercent / 100)).toFixed(2) : null;
            const discountedPrice = discount ? 
              (product.price - parseFloat(discount)).toFixed(2) : null;

            return (
              <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-2">{product.title}</CardTitle>
                      <CardDescription>{product.brand}</CardDescription>
                    </div>
                    {product.promotion && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap">
                        -{product.promotion.discountPercent}%
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {product.image && (
                    <div className="w-full h-40 bg-slate-100 rounded overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Par {vendor?.storeName}</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      {discountedPrice ? (
                        <>
                          <span className="text-xl font-bold text-primary">{discountedPrice}€</span>
                          <span className="text-sm line-through text-muted-foreground">
                            {product.price.toFixed(2)}€
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-primary">
                          {product.price.toFixed(2)}€
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.stock > 0 ? product.stock : 'Rupture'}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0}
                    className="w-full gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Ajouter au panier
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
