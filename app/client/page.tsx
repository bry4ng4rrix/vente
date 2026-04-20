'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAllProducts, addToCart, getUserById, getCart, removeFromCart, updateCartItem, clearCart, getProductById } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { ShoppingCart, Star, Trash2, User } from 'lucide-react';

export default function ClientHomePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState(getCart());

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

  const cartItems = useMemo(() => {
    return cart.map(item => ({
      ...item,
      product: getProductById(item.productId),
    })).filter(item => item.product);
  }, [cart]);

  const { subtotal, discount, total } = useMemo(() => {
    let subtotal = 0;
    let discount = 0;

    cartItems.forEach(item => {
      if (item.product) {
        const itemPrice = item.price * item.quantity;
        subtotal += itemPrice;

        if (item.product.promotion) {
          const discountAmount = (item.price * (item.product.promotion.discountPercent / 100)) * item.quantity;
          discount += discountAmount;
        }
      }
    });

    return {
      subtotal,
      discount,
      total: subtotal - discount,
    };
  }, [cartItems]);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart({
        productId,
        quantity: 1,
        price: product.price,
      });
      setCart(getCart());
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    setCart(getCart());
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
    } else {
      updateCartItem(productId, quantity);
      setCart(getCart());
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bienvenue, {user.name} !</h1>
          <p className="text-muted-foreground">Explorez nos produits et faites vos achats</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/client/profile">
            <User className="w-4 h-4" />
            Mon Profil
          </Link>
        </Button>
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

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Votre panier</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {cartItems.length === 0 ? (
              <Card>
                <CardContent className="pt-12 text-center space-y-4">
                  <p className="text-muted-foreground">Votre panier est vide</p>
                  <Button asChild>
                    <Link href="/client">Continuer vos achats</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {cartItems.map((item) => (
                    <Card key={item.productId} className="bg-white/80">
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          {item.product?.image && (
                            <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden shrink-0">
                              <img
                                src={item.product.image}
                                alt={item.product.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold line-clamp-2">{item.product?.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.product?.brand}
                            </p>

                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  className="px-3 py-1 border rounded hover:bg-slate-100"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  className="px-3 py-1 border rounded hover:bg-slate-100"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveItem(item.productId)}
                                className="ml-auto text-destructive hover:text-destructive/80 p-2"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-semibold text-lg">
                              {(item.price * item.quantity).toFixed(2)}€
                            </p>
                            {item.product?.promotion && (
                              <p className="text-sm text-green-600">
                                -{item.product.promotion.discountPercent}%
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-lg">Résumé de la commande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{subtotal.toFixed(2)}€</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Réduction</span>
                        <span>-{discount.toFixed(2)}€</span>
                      </div>
                    )}

                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{total.toFixed(2)}€</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        asChild
                        className="w-full"
                        size="lg"
                      >
                        <Link href="/client/cart">
                          Voir le panier complet
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                      >
                        <Link href="/client">Continuer vos achats</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Cart Button */}
      <Button
        onClick={() => setShowCart(!showCart)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 gap-2"
        size="lg"
      >
        <ShoppingCart className="w-6 h-6" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {cartItems.length}
          </span>
        )}
      </Button>

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
