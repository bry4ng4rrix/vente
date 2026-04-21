# Base de données pour l'application de gestion de stock (Supabase/PostgreSQL)

## Schéma de la base de données

### 1. Table des utilisateurs (users)

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'vendor', 'admin')),
  phone VARCHAR(20),
  address TEXT,
  bio TEXT,
  avatar TEXT,
  store_name VARCHAR(255),
  store_description TEXT,
  store_image TEXT,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2. Table des produits (products)

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  brand VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category VARCHAR(100) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at);
```

### 3. Table des promotions (promotions)

```sql
CREATE TABLE promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  discount_percent DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_promotions_product_id ON promotions(product_id);
CREATE INDEX idx_promotions_valid_until ON promotions(valid_until);
CREATE INDEX idx_promotions_is_active ON promotions(is_active);
```

### 4. Table des paniers (cart_items)

```sql
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unicité: un produit ne peut être qu'une seule fois dans le panier d'un utilisateur
  UNIQUE(user_id, product_id)
);

-- Index
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
```

### 5. Table des commandes (orders)

```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### 6. Table des détails de commande (order_items)

```sql
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) STORED
);

-- Index
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### 7. Table des catégories (categories)

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);
```

### 8. Table des badges (badges)

```sql
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  required_achievement TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_badges_is_active ON badges(is_active);
```

### 9. Table des avis/reviews (reviews)

```sql
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un client ne peut donner qu'un seul avis par produit
  UNIQUE(product_id, client_id)
);

-- Index
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_client_id ON reviews(client_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_is_verified ON reviews(is_verified);
```

### 10. Table des notifications (notifications)

```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('order', 'promotion', 'system', 'review')),
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## Fonctions et Triggers

### Trigger pour mettre à jour `updated_at`

```sql
-- Fonction pour mettre à jour le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour les tables qui ont updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Fonctions utilitaires

```sql
-- Fonction pour calculer le prix avec promotion
CREATE OR REPLACE FUNCTION get_product_price_with_promotion(product_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    base_price DECIMAL(10,2);
    promotion_discount DECIMAL(10,2) := 0;
    final_price DECIMAL(10,2);
BEGIN
    -- Récupérer le prix de base du produit
    SELECT price INTO base_price FROM products WHERE id = product_uuid AND is_active = true;
    
    IF base_price IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Récupérer la promotion active la plus récente
    SELECT 
        CASE 
            WHEN type = 'percentage' THEN (base_price * discount_percent / 100)
            WHEN type = 'fixed' THEN discount_amount
            ELSE 0
        END INTO promotion_discount
    FROM promotions 
    WHERE product_id = product_uuid 
        AND is_active = true 
        AND valid_until > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Calculer le prix final
    final_price := base_price - COALESCE(promotion_discount, 0);
    
    RETURN GREATEST(final_price, 0); -- Éviter les prix négatifs
END;
$$ LANGUAGE plpgsql;

-- Vue pour les produits avec prix promotionnel
CREATE VIEW products_with_promotions AS
SELECT 
    p.*,
    get_product_price_with_promotion(p.id) as promotional_price,
    CASE 
        WHEN get_product_price_with_promotion(p.id) < p.price THEN true
        ELSE false
    END as has_promotion,
    (p.price - get_product_price_with_promotion(p.id)) as discount_amount,
    ROUND(((p.price - get_product_price_with_promotion(p.id)) / p.price * 100), 2) as discount_percent
FROM products p
WHERE p.is_active = true;
```

## Politiques de sécurité (RLS - Row Level Security)

```sql
-- Activer RLS sur les tables sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour la table cart_items
CREATE POLICY "Users can view own cart" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour la table orders
CREATE POLICY "Clients can view own orders" ON orders
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Vendors can view orders for their products" ON orders
    FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update order status" ON orders
    FOR UPDATE USING (auth.uid() = vendor_id);

-- Politiques pour la table reviews
CREATE POLICY "Users can view all reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own reviews" ON reviews
    FOR ALL USING (auth.uid() = client_id);

-- Politiques pour la table notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);
```

## Données initiales (Seed Data)

```sql
-- Insérer des catégories par défaut
INSERT INTO categories (name, description, icon) VALUES
('Électronique', 'Appareils électroniques et gadgets', 'laptop'),
('Vêtements', 'Vêtements et accessoires de mode', 'shirt'),
('Accessoires', 'Accessoires divers', 'package'),
('Chaussures', 'Chaussures pour tous les styles', 'footprint'),
('Maison', 'Articles pour la maison', 'home'),
('Sports', 'Équipements sportifs', 'trophy');

-- Insérer des badges par défaut
INSERT INTO badges (name, description, icon, required_achievement) VALUES
('Premier Achat', 'A effectué le premier achat sur la plateforme', 'shopping-cart', 'first_purchase'),
('Vendeur Confirmé', 'Vendeur avec plus de 10 ventes', 'check-circle', 'vendor_confirmed'),
('Expert Vendeur', 'Vendeur avec plus de 50 ventes', 'star', 'vendor_expert'),
('Client Fidèle', 'Plus de 20 achats effectués', 'heart', 'loyal_customer'),
('Top Avis', 'A reçu plus de 50 avis positifs', 'award', 'top_reviewer');

-- Créer un utilisateur admin par défaut
INSERT INTO users (email, password, name, role, phone, address, bio) VALUES
('admin@marketplace.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Administrateur', 'admin', '+221 77 123 45 67', 'Dakar, Sénégal', 'Administrateur de la plateforme');
```

## Instructions pour Supabase

1. **Créer le projet Supabase**
   - Aller sur https://supabase.com
   - Créer un nouveau projet
   - Noter les clés API et l'URL du projet

2. **Exécuter le SQL**
   - Dans le dashboard Supabase → SQL Editor
   - Copier-coller les requêtes SQL ci-dessus
   - Exécuter les tables une par une

3. **Configuration de l'authentification**
   - Activer l'authentification email/password
   - Configurer les redirections URL
   - Personnaliser les emails de confirmation

4. **Variables d'environnement**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

5. **Installation des dépendances**
   ```bash
   npm install @supabase/supabase-js
   npm install @supabase/auth-helpers-nextjs
   ```

## Index de recherche全文

```sql
-- Créer un index de recherche pour les produits
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_products_search ON products USING gin(to_tsvector('french', title || ' ' || description || ' ' || brand));

-- Fonction de recherche
CREATE OR REPLACE FUNCTION search_products(query TEXT)
RETURNS TABLE(
    id UUID,
    title VARCHAR(255),
    description TEXT,
    brand VARCHAR(255),
    price DECIMAL(10,2),
    category VARCHAR(100),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.brand,
        p.price,
        p.category,
        ts_rank(to_tsvector('french', p.title || ' ' || p.description || ' ' || p.brand), plainto_tsquery('french', query)) as rank
    FROM products p
    WHERE 
        p.is_active = true
        AND to_tsvector('french', p.title || ' ' || p.description || ' ' || p.brand) @@ plainto_tsquery('french', query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

Cette structure de base de données est optimisée pour Supabase/PostgreSQL et inclut toutes les fonctionnalités nécessaires pour l'application de gestion de stock avec marketplace.