'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Loader2, User, Phone, Briefcase, Info, Shirt } from 'lucide-react';
import { submitOrder, type State } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import type { SweatshirtType } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';


const sweatshirtOptions = {
  default: {
    type: 'default' as SweatshirtType,
    name: 'Felpa Ufficiale',
    price: 15,
    image: PlaceHolderImages.find((img) => img.id === 'default-sweatshirt'),
  },
  zip: {
    type: 'zip' as SweatshirtType,
    name: 'Felpa Ufficiale + Giacca',
    price: 43,
    image: PlaceHolderImages.find((img) => img.id === 'zip-sweatshirt'),
  },
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full text-lg py-6">
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
  
  const [sweatshirtType, setSweatshirtType] = useState<SweatshirtType>('default');
  const [total, setTotal] = useState(sweatshirtOptions.default.price);

  const currentSweatshirt = sweatshirtOptions[sweatshirtType];

  useEffect(() => {
    setTotal(currentSweatshirt.price);
  }, [currentSweatshirt]);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Successo!',
          description: state.message,
        });
        formRef.current?.reset();
        setSweatshirtType('default');
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
      
      <div>
        <Label className="text-lg font-semibold mb-2 block">Scegli la felpa</Label>
        <RadioGroup name="sweatshirtType" value={sweatshirtType} onValueChange={(value) => setSweatshirtType(value as SweatshirtType)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(sweatshirtOptions).map((option) => (
            <div key={option.type}>
              <RadioGroupItem value={option.type} id={`sweatshirt-${option.type}`} className="sr-only" />
              <Label htmlFor={`sweatshirt-${option.type}`}>
                <Card className={cn("cursor-pointer hover:border-primary transition-colors h-full", sweatshirtType === option.type && "border-primary ring-2 ring-primary")}>
                    {option.image && (
                        <CardHeader className="p-0">
                            <Image
                                src={option.image.imageUrl}
                                alt={option.image.description}
                                data-ai-hint={option.image.imageHint}
                                width={400}
                                height={300}
                                className="rounded-t-lg w-full aspect-[4/3] object-cover"
                            />
                        </CardHeader>
                    )}
                   <CardContent className="p-4 space-y-1">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Shirt className="w-5 h-5" />
                        {option.name}
                      </CardTitle>
                      <p className="text-2xl font-bold text-primary">€{option.price.toFixed(2)}</p>
                   </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
        {state.errors?.sweatshirtType && <p className="text-sm font-medium text-destructive">{state.errors.sweatshirtType}</p>}
      </div>

      <div>
        <Label htmlFor="service" className="text-lg font-semibold mb-2 block">Servizio</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Textarea id="service" name="service" placeholder="Descrivi il servizio richiesto (es. ricamo personalizzato, patch, etc.)" className="pl-10" />
        </div>
        {state.errors?.service && <p className="text-sm font-medium text-destructive">{state.errors.service}</p>}
      </div>
      
      <div className="space-y-4 rounded-lg bg-muted/50 p-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Totale</span>
          <span className="text-2xl font-bold text-primary">€{total.toFixed(2)}</span>
        </div>
      </div>
      
      <SubmitButton />
    </form>
  );
}
