import { Order, Product } from './types';

const POCKETBASE_URL = 'https://pocketbase.eulab.cloud';
const COLLECTION = 'pdg_servizio_felpa';

export async function getOrders(): Promise<Order[]> {
  
  const url = new URL(
    `/api/collections/${COLLECTION}/records`,
    POCKETBASE_URL
  );
  
  // Fetch all records, we will filter on the client
  url.searchParams.set('perPage', '500'); // Adjust as needed
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
