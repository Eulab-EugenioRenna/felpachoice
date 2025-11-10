import { Order, Product } from './types';

const POCKETBASE_URL = 'https://pocketbase.eulab.cloud';
const COLLECTION = 'pdg_servizio_felpa';

export async function getOrders(
  search?: string,
  category?: Product['category'] | '',
): Promise<Order[]> {
  const filterParts: string[] = [];

  if (search) {
    // PocketBase uses `~` for LIKE operator
    // Search in name, phone, and within the items for product name or service
    const searchFilter = `(request.name ~ "${search}" || request.phone ~ "${search}" || request.items.productName ~ "${search}" || request.items.service ~ "${search}" || request.service ~ "${search}")`
    filterParts.push(searchFilter);
  }

  if (category) {
    // Filter by item category for new orders
    const categoryFilter = `(request.items.category ~ "${category}")`;
    filterParts.push(categoryFilter);
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
  // Expand items to allow filtering by category
  url.searchParams.set('expand', 'request.items'); 


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
