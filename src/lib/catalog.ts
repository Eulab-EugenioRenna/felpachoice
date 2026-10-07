import type { Product, ProductCategory } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const products: Product[] = [
  {
    id: 'jhk-sweatshirt',
    name: 'Felpa Ufficiale - JHK',
    price: 12,
    imageUrl: '/images/default-sweatshirt.png',
    imageHint: 'green sweatshirt',
    category: 'felpa',
  },
  {
    id: 'payper-sweatshirt',
    name: 'Felpa Ufficiale - PAYPER',
    price: 15,
    imageUrl: '/images/default-sweatshirt.png',
    imageHint: 'green sweatshirt',
    category: 'felpa',
  },
  {
    id: 'official-tshirt',
    name: 'Maglia Ufficiale',
    price: 6,
    imageUrl: '/images/maglia_media.jpg',
    imageHint: 'tshirt media service',
    category: 'maglia',
  },
];

export const services = [
  'media',
  'army',
  'welcome',
  'security',
  'kids',
  'libreria',
  'cleaner',
  'battesimi',
];

const servicesByCategory: Record<ProductCategory, string[]> = {
  felpa: services.filter((service) => service !== 'battesimi'),
  maglia: services,
};

export const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export function getPlaceholderImage(category: ProductCategory, service?: string) {
  if (service) {
    const serviceImage = PlaceHolderImages.find((img) => img.id === `${category}-${service}`);
    if (serviceImage) {
      return serviceImage;
    }
  }

  return PlaceHolderImages.find((img) => img.id === `${category}-none`) ?? null;
}

export function getServicesForCategory(category: ProductCategory) {
  return servicesByCategory[category];
}

export function getProductsForService(service?: string): Product[] {
  if (service === 'army') {
    // Su army lasciamo solo maglia e felpa da 15€ (PAYPER)
    return products.filter((p) => p.id === 'payper-sweatshirt' || p.id === 'official-tshirt');
  }
  if (service === 'battesimi') {
    return products.filter((p) => p.category === 'maglia');
  }
  return products;
}

export function getServicesForProduct(product?: Product | string | null): string[] {
  if (!product) {
    return services;
  }

  const prod = typeof product === 'string'
    ? products.find((p) => p.id === product)
    : product;

  if (!prod) {
    if (product === 'felpa' || product === 'maglia') {
      return getServicesForCategory(product);
    }
    return services;
  }

  if (prod.category === 'felpa') {
    return services.filter((service) => service !== 'battesimi');
  }

  return services;
}

export function isServiceAllowedForProduct(service: string, product?: Product | string | null): boolean {
  const prod = typeof product === 'string'
    ? products.find((p) => p.id === product)
    : product;

  if (!prod) return true;

  if (service === 'army' && prod.id === 'jhk-sweatshirt') {
    return false;
  }
  if (service === 'battesimi' && prod.category === 'felpa') {
    return false;
  }
  return true;
}

export function getProductPrice(product: Product | string, service?: string): number {
  const prod = typeof product === 'string' ? products.find((p) => p.id === product) : product;
  if (!prod) return 0;
  if (prod.id === 'official-tshirt' && service === 'army') {
    return 7;
  }
  return prod.price;
}

export function normalizeProductCategory(category?: string): ProductCategory {
  return category === 'maglia' || category === 'tshirt' ? 'maglia' : 'felpa';
}

export function getCategoryLabel(category: ProductCategory) {
  return category === 'felpa' ? 'Felpa' : 'Maglia';
}

export function getLegacyCategoryLabel() {
  return 'Felpa';
}
