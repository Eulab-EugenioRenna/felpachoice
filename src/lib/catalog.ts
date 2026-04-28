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

export function getCategoryLabel(category: ProductCategory) {
  return category === 'felpa' ? 'Felpa' : 'Maglia';
}

export function getLegacyCategoryLabel() {
  return 'Felpa';
}
