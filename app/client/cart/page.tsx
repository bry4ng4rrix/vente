'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getCart, removeFromCart, updateCartItem, clearCart, getProductById, saveOrder } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(getCart());
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    setIsProcessing(true);

    try {
      // Group items by vendor
      const ordersByVendor = new Map();
      cartItems.forEach(item => {
        const vendorId = item.product?.vendorId;
        if (!ordersByVendor.has(vendorId)) {
          ordersByVendor.set(vendorId, []);
        }
        ordersByVendor.get(vendorId).push(item);
      });

      // Create orders for each vendor
      let totalOrderPrice = 0;
      ordersByVendor.forEach((items, vendorId) => {
        const vendorTotal = items.reduce((sum, item) => {
          const itemPrice = item.price * item.quantity;
          const discount = item.product?.promotion ? 
            (item.price * (item.product.promotion.discountPercent / 100)) * item.quantity : 0;
          return sum + itemPrice - discount;
        }, 0);

        totalOrderPrice += vendorTotal;

        const order = {
          id: `order-${Date.now()}-${Math.random()}`,
          clientId: user?.id || '',
          vendorId,
          items,
          totalPrice: vendorTotal,
          totalAmount: vendorTotal,
          status: 'completed' as const,
          createdAt: new Date().toISOString(),
        };

        saveOrder(order as any);
      });

      clearCart();
      setCart([]);

      alert(`Commande passée avec succès ! Total: ${total.toFixed(2)}€`);
      router.push('/client/orders');
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      alert('Erreur lors de la commande');
    }

    setIsProcessing(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Votre panier</h1>
        <p className="text-muted-foreground mt-2">
          {cartItems.length} article{cartItems.length !== 1 ? 's' : ''} dans votre panier
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
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
            cartItems.map((item) => (
              <Card key={item.productId}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {item.product?.image && (
                      <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{item.product?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.product?.brand}
                      </p>

                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="px-2 py-1 border rounded hover:bg-slate-100"
                          >
                            −
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="px-2 py-1 border rounded hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="ml-auto text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">
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
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
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

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? 'Traitement...' : 'Valider la commande'}
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/client">Continuer vos achats</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
