import { User, Product, Order, CartItem } from './types';

const USERS_KEY = 'marketplace_users';
const PRODUCTS_KEY = 'marketplace_products';
const ORDERS_KEY = 'marketplace_orders';
const CART_KEY = 'marketplace_cart';

// Default demo data
const DEMO_USERS: User[] = [
  {
    id: 'user-1',
    email: 'client@example.com',
    password: 'password123',
    name: 'Jean Client',
    role: 'client',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    email: 'vendor1@example.com',
    password: 'password123',
    name: 'Sophie Vendeur',
    role: 'vendor',
    storeName: 'Boutique Tech Pro',
    storeDescription: 'Électronique et accessoires de qualité',
    totalSales: 12,
    totalRevenue: 450.50,
    badges: ['first-sale', 'confirmed-seller'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    email: 'vendor2@example.com',
    password: 'password123',
    name: 'Marc Entrepreneur',
    role: 'vendor',
    storeName: 'Magasin Mode & Style',
    storeDescription: 'Vêtements et accessoires tendance',
    totalSales: 28,
    totalRevenue: 1200.75,
    badges: ['first-sale', 'confirmed-seller', 'expert-seller'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-4',
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    vendorId: 'user-2',
    title: 'Laptop Gaming Ultra Puissant',
    description: 'Ordinateur portable haute performance pour gaming',
    brand: 'TechMax',
    price: 1299.99,
    category: 'Électronique',
    stock: 5,
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%223b82f6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22 fill=%22white%22 font-family=%22Arial%22%3ELaptop Gaming%3C/text%3E%3C/svg%3E',
    promotion: {
      type: 'percentage',
      discountPercent: 10,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    vendorId: 'user-2',
    title: 'Souris Sans Fil Premium',
    description: 'Souris ergonomique avec précision de tracking',
    brand: 'TechMax',
    price: 49.99,
    category: 'Accessoires',
    stock: 50,
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%2310b981%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2220%22 fill=%22white%22 font-family=%22Arial%22%3ESouris Wireless%3C/text%3E%3C/svg%3E',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    vendorId: 'user-3',
    title: 'Robe Élégante Noir',
    description: 'Robe tendance parfaite pour les occasions spéciales',
    brand: 'StyleMode',
    price: 89.99,
    category: 'Vêtements',
    stock: 20,
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22f59e0b%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2220%22 fill=%22white%22 font-family=%22Arial%22%3ERobe Noir%3C/text%3E%3C/svg%3E',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    vendorId: 'user-3',
    title: 'Sneakers Sport Confortable',
    description: 'Chaussures de sport modernes et confortables',
    brand: 'StyleMode',
    price: 79.99,
    category: 'Chaussures',
    stock: 15,
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%23ec4899%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2220%22 fill=%22white%22 font-family=%22Arial%22%3ESneakers%3C/text%3E%3C/svg%3E',
    promotion: {
      type: 'percentage',
      discountPercent: 15,
      validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date().toISOString(),
  },
];

// Users
export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return DEMO_USERS;
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : DEMO_USERS;
}

export function getUserById(id: string): User | undefined {
  return getAllUsers().find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getAllUsers().find(u => u.email === email);
}

export function saveUser(user: User): void {
  if (typeof window === 'undefined') return;
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function deleteUser(id: string): void {
  if (typeof window === 'undefined') return;
  const users = getAllUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Products
export function getAllProducts(): Product[] {
  if (typeof window === 'undefined') return DEMO_PRODUCTS;
  const stored = localStorage.getItem(PRODUCTS_KEY);
  return stored ? JSON.parse(stored) : DEMO_PRODUCTS;
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find(p => p.id === id);
}

export function getProductsByVendor(vendorId: string): Product[] {
  return getAllProducts().filter(p => p.vendorId === vendorId);
}

export function saveProduct(product: Product): void {
  if (typeof window === 'undefined') return;
  const products = getAllProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function deleteProduct(id: string): void {
  if (typeof window === 'undefined') return;
  const products = getAllProducts().filter(p => p.id !== id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// Orders
export function getAllOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getOrdersByClient(clientId: string): Order[] {
  return getAllOrders().filter(o => o.clientId === clientId);
}

export function getOrdersByVendor(vendorId: string): Order[] {
  return getAllOrders().filter(o => o.vendorId === vendorId);
}

export function saveOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.push(order);
  }
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Cart
export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addToCart(item: CartItem): void {
  if (typeof window === 'undefined') return;
  const cart = getCart();
  const existing = cart.find(c => c.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function removeFromCart(productId: string): void {
  if (typeof window === 'undefined') return;
  const cart = getCart().filter(c => c.productId !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify([]));
}

export function updateCartItem(productId: string, quantity: number): void {
  if (typeof window === 'undefined') return;
  const cart = getCart();
  const item = cart.find(c => c.productId === productId);
  if (item) {
    item.quantity = quantity;
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
