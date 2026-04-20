'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getProductsByVendor, saveProduct, deleteProduct } from '@/lib/storage';
import { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VendorProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState(getProductsByVendor(user?.id || ''));
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });

  if (!user) return null;

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.category) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    const product: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      vendorId: user.id,
      title: formData.title,
      description: formData.description,
      brand: formData.brand,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      image: formData.image,
      promotion: editingProduct?.promotion,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    };

    saveProduct(product);
    setProducts(getProductsByVendor(user.id));
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      brand: '',
      price: '',
      category: '',
      stock: '',
      image: '',
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      brand: product.brand,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image || '',
    });
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(productId);
      setProducts(getProductsByVendor(user.id));
    }
  };

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const inStockCount = products.filter(p => p.stock > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes produits</h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre catalogue de produits
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inStockCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add product button and search */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => {
          setEditingProduct(null);
          setFormData({
            title: '',
            description: '',
            brand: '',
            price: '',
            category: '',
            stock: '',
            image: '',
          });
          setShowForm(true);
        }} size="lg">
          Ajouter un produit
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Titre du produit"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Marque</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="Marque"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Prix (€) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="9.99"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="Électronique, Vêtements, etc."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Image (URL ou base64)</label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://... ou data:image/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description du produit"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingProduct ? 'Modifier' : 'Ajouter'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products list */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center space-y-4">
            <p className="text-muted-foreground">
              {products.length === 0
                ? 'Aucun produit pour le moment'
                : 'Aucun produit ne correspond à votre recherche'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2 text-base">{product.title}</CardTitle>
                <CardDescription>{product.brand}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {product.image ? (
                  <div className="w-full h-40 bg-slate-100 rounded overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-slate-100 rounded flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Pas d&apos;image</span>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix</span>
                    <span className="font-semibold">{product.price.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock</span>
                    <span className={`font-semibold ${product.stock === 0 ? 'text-destructive' : ''}`}>
                      {product.stock}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catégorie</span>
                    <span className="font-semibold text-xs bg-slate-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 text-destructive hover:bg-destructive/10"
                  >
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
