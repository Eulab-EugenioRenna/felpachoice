import { Order, SweatshirtType, ServiceType } from './types';

const POCKETBASE_URL = 'https://pocketbase.eulab.cloud';
const COLLECTION = 'pdg_servizio_felpa';

export async function getOrders(
  search?: string,
  sweatshirtType?: SweatshirtType | string,
  service?: string,
): Promise<Order[]> {
  const filterParts: string[] = [];
  if (search) {
    // PocketBase uses `~` for LIKE operator
    // Search in new and old data structures
    filterParts.push(`(request.name ~ "${search}" || request.phone ~ "${search}" || request.items.productName ~ "${search}")`);
  }
  if (sweatshirtType && (sweatshirtType === 'default' || sweatshirtType === 'zip')) {
    // This filter only works for legacy orders
    filterParts.push(`request.sweatshirtType = "${sweatshirtType}"`);
  }
   if (service) {
    // Search in new and old data structures
    filterParts.push(`(request.service ~ "${service}" || request.items.service ~ "${service}")`);
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
