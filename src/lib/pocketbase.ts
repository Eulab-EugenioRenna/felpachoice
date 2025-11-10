import { Order, SweatshirtType, ServiceType } from './types';

const POCKETBASE_URL = 'https://pocketbase.eulab.cloud';
const COLLECTION = 'pdg_servizio_felpa';

export async function getOrders(
  search?: string,
  sweatshirtType?: SweatshirtType | string,
  serviceType?: ServiceType | string,
): Promise<Order[]> {
  const filterParts: string[] = [];
  if (search) {
    // PocketBase uses `~` for LIKE operator
    filterParts.push(`(request.name ~ "${search}" || request.phone ~ "${search}")`);
  }
  if (sweatshirtType && (sweatshirtType === 'default' || sweatshirtType === 'zip')) {
    filterParts.push(`request.sweatshirtType = "${sweatshirtType}"`);
  }
   if (serviceType && (serviceType === 'basic' || serviceType === 'premium')) {
    filterParts.push(`request.serviceType = "${serviceType}"`);
  }

  const filter = filterParts.join(' && ');
  const url = new URL(
    `/api/collections/${COLLECTION}/records`,
    POCKETBASE_URL
  );
  if (filter) {
    url.searchParams.set('filter', filter);
  }
  url.searchParams.set('sort', '-created');

  try {
    const response = await fetch(url.toString(), {
      // Use no-store to ensure fresh data on every request
      cache: 'no-store',
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to fetch orders:', errorData);
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items as Order[];
  } catch (error) {
    console.error('Error fetching from PocketBase:', error);
    // Return empty array on error to prevent crashing the page
    return [];
  }
}
