export type SweatshirtType = 'default' | 'zip';
export type ServiceType = 'basic' | 'premium';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  category: 'sweatshirt' | 'jacket';
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size: string;
  service: string;
}

export interface Order {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  request: {
    name: string;
    phone: string;
    // Legacy fields for backward compatibility
    sweatshirtType?: SweatshirtType;
    size?: string;
    service?: string;
    price?: number;
    // New structure
    items?: OrderItem[];
    total?: number;
  };
}
