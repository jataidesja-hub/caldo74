export interface ProductOption {
  id: string;
  name: string;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  required: boolean;
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  category: string;
  imageUrl: string;
  promoPrice?: number;
  externalUrl?: string;
  optionGroups?: ProductOptionGroup[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  isExternalLinks?: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  productIds: string[];
  active: boolean;
  expiresAt?: string | null;
  showOnStart?: boolean;
}

export interface OpeningHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

export interface StoreConfig {
  name: string;
  font: string;
  primaryColor: string;
  logoUrl: string;
  address: string;
  lat: number;
  lng: number;
  deliveryFeePerKm: number;
  slogan: string;
  whatsapp: string;
  pixKey?: string;
  openingHours?: OpeningHours;
  informativeText?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>; // groupId -> option name
}

export interface Order {
  id: string;
  items: CartItem[];
  customerName: string;
  customerWhatsapp: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  deliveryFee: number;
  subtotal: number;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
  paymentMethod: 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';
  changeFor?: number | null;
  isPaid: boolean;
}
