'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Loader2, User, Phone } from 'lucide-react';
import { submitOrder, type State } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const sweatshirtOptions = [
  {
    type: 'default',
    name: 'Felpa Standard',
    price: 15,
    image: PlaceHolderImages.find((img) => img.id === 'default-sweatshirt'),
  },
  {
    type: 'zip',
    name: 'Felpa con Zip',
    price: 28,
    image: PlaceHolderImages.find((img) => img.id === 'zip-sweatshirt'),
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full mt-6 text-lg py-6">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inviando...
        </>
      ) : (
        'Invia Ordine'
      )}
    </Button>
  );
}

export function OrderForm() {
  const initialState: State = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(submitOrder, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Successo!',
          description: state.message,
        });
        formRef.current?.reset();
      } else {
        toast({
          title: 'Errore',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-8">
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input id="name" name="name" type="text" placeholder="Nome e Cognome" className="pl-10 h-12" required />
        </div>
        {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name}</p>}

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input id="phone" name="phone" type="tel" placeholder="Numero di Telefono" className="pl-10 h-12" required />
        </div>
        {state.errors?.phone && <p className="text-sm font-medium text-destructive">{state.errors.phone}</p>}
      </div>
      
      <RadioGroup name="sweatshirtType" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sweatshirtOptions.map((option) => (
          <div key={option.type}>
            <RadioGroupItem value={option.type} id={option.type} className="sr-only" />
            <Label htmlFor={option.type}>
              <Card className="cursor-pointer hover:border-primary transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-2 has-[[data-state=checked]]:ring-primary">
                 <CardContent className="p-4 flex flex-col items-center text-center">
                    {option.image && (
                      <Image
                        src={option.image.imageUrl}
                        alt={option.image.description}
                        data-ai-hint={option.image.imageHint}
                        width={150}
                        height={150}
                        className="rounded-md mb-4 aspect-square object-cover"
                      />
                    )}
                    <p className="font-semibold text-lg">{option.name}</p>
                    <p className="text-2xl font-bold text-primary mt-1">€{option.price}</p>
                 </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>
      {state.errors?.sweatshirtType && <p className="text-sm font-medium text-destructive">{state.errors.sweatshirtType}</p>}
      
      <SubmitButton />
    </form>
  );
}
