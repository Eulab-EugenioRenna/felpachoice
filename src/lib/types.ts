export type SweatshirtType = 'default' | 'zip';

export type ServiceType = 'basic' | 'premium';

export interface Order {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  request: {
    name: string;
    phone: string;
    sweatshirtType: SweatshirtType;
    serviceType: ServiceType;
    price: number;
  };
}
