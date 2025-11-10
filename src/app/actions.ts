'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { OrderItem } from '@/lib/types';

const POCKETBASE_URL = 'https://pocketbase.eulab.cloud';
const COLLECTION = 'pdg_servizio_felpa';

const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().min(1),
  price: z.number(),
  size: z.string(),
  service: z.string(),
});

const orderSchema = z.object({
  name: z.string().min(2, { message: 'Il nome è obbligatorio.' }),
  phone: z.string().min(5, { message: 'Il numero di telefono è obbligatorio.' }),
  orderItems: z.array(orderItemSchema).min(1, { message: "L'ordine deve contenere almeno un articolo." }),
});

export type State = {
  errors?: {
    name?: string[];
    phone?: string[];
    orderItems?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function submitOrder(prevState: State, formData: FormData): Promise<State> {
  let items: OrderItem[];
  try {
    const itemsJson = formData.get('orderItems') as string;
    items = JSON.parse(itemsJson);
  } catch (e) {
    return {
      message: "Errore nell'elaborazione degli articoli.",
      success: false,
    };
  }

  const validatedFields = orderSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    orderItems: items,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Compila i campi mancanti. Impossibile creare l\'ordine.',
      success: false,
    };
  }
  
  const { name, phone, orderItems } = validatedFields.data;
  
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const requestPayload = {
    request: {
      name,
      phone,
      items: orderItems,
      total,
    },
  };
  
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/${COLLECTION}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('PocketBase error:', errorData);
        // This is a guess on the error structure, adjust if needed
        const errorMessage = errorData?.data?.message || 'Impossibile salvare l\'ordine.';
        return { message: `Errore del database: ${errorMessage}`, success: false };
    }

    revalidatePath('/orders');
    return { message: 'Ordine creato con successo!', success: true };
  } catch (error) {
    console.error('Network error:', error);
    return { message: 'Errore di rete: Impossibile connettersi al database.', success: false };
  }
}
