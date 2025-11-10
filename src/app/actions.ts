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
  serviceType: z.enum(['basic', 'premium'], {
    required_error: 'Devi selezionare un tipo di servizio.',
  }),
});

export type State = {
  errors?: {
    name?: string[];
    phone?: string[];
    sweatshirtType?: string[];
    serviceType?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function submitOrder(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = orderSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    sweatshirtType: formData.get('sweatshirtType'),
    serviceType: formData.get('serviceType')
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Compila i campi mancanti. Impossibile creare l\'ordine.',
      success: false,
    };
  }
  
  const { name, phone, sweatshirtType, serviceType } = validatedFields.data;
  
  let price = 0;
  if (sweatshirtType === 'default') {
    price += 15;
  } else {
    price += 28;
  }

  if (serviceType === 'premium') {
    price += 5;
  }

  const requestPayload = {
    request: {
      name,
      phone,
      sweatshirtType,
      serviceType,
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
