'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const POCKETBASE_URL = 'https://pocketbase.eulab.cloud';
const COLLECTION = 'pdg_servizio_felpa';

const orderSchema = z.object({
  name: z.string().min(2, { message: 'Il nome è obbligatorio.' }),
  phone: z.string().min(5, { message: 'Il numero di telefono è obbligatorio.' }),
  sweatshirtType: z.enum(['default', 'zip'], {
    required_error: 'Devi selezionare un tipo di felpa.',
  }),
  size: z.string().min(1, { message: 'La taglia è obbligatoria.' }),
  service: z.enum(['media', 'welcome', 'security']).optional(),
});

export type State = {
  errors?: {
    name?: string[];
    phone?: string[];
    sweatshirtType?: string[];
    size?: string[];
    service?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function submitOrder(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = orderSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    sweatshirtType: formData.get('sweatshirtType'),
    size: formData.get('size'),
    service: formData.get('service')
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Compila i campi mancanti. Impossibile creare l\'ordine.',
      success: false,
    };
  }
  
  const { name, phone, sweatshirtType, size, service } = validatedFields.data;
  
  let price = 0;
  if (sweatshirtType === 'default') {
    price = 15;
  } else {
    price = 43;
  }

  const requestPayload = {
    request: {
      name,
      phone,
      sweatshirtType,
      size,
      service: service || '',
      price,
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
        const errorMessage = errorData?.data?.request?.message || 'Impossibile salvare l\'ordine.';
        return { message: `Errore del database: ${errorMessage}`, success: false };
    }

    revalidatePath('/orders');
    return { message: 'Ordine creato con successo!', success: true };
  } catch (error) {
    console.error('Network error:', error);
    return { message: 'Errore di rete: Impossibile connettersi al database.', success: false };
  }
}
