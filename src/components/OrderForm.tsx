'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Loader2, User, Phone, Briefcase, Info } from 'lucide-react';
import { submitOrder, type State } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ServiceType } from '@/lib/types';


const sweatshirtOptions = {
  default: {
    type: 'default',
    name: 'Felpa Standard',
    price: 15,
    image: PlaceHolderImages.find((img) => img.id === 'default-sweatshirt'),
  },
  zip: {
    type: 'zip',
    name: 'Felpa con Zip',
    price: 28,
    image: PlaceHolderImages.find((img) => img.id === 'zip-sweatshirt'),
  },
};

const serviceOptions = {
  basic: {
    type: 'basic' as ServiceType,
    name: 'Servizio Base',
    price: 0,
    description: 'Servizio di base incluso nel prezzo.',
  },
  premium: {
    type: 'premium' as ServiceType,
    name: 'Servizio Premium',
    price: 5,
    description: 'Include trattamento speciale e consegna prioritaria.',
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
  
  const [addZip, setAddZip] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('basic');
  const [total, setTotal] = useState(sweatshirtOptions.default.price + serviceOptions.basic.price);

  const sweatshirtType = addZip ? 'zip' : 'default';
  const currentSweatshirt = addZip ? sweatshirtOptions.zip : sweatshirtOptions.default;

  useEffect(() => {
    const sweatshirtPrice = addZip ? sweatshirtOptions.zip.price : sweatshirtOptions.default.price;
    const servicePrice = serviceOptions[selectedService].price;
    setTotal(sweatshirtPrice + servicePrice);
  }, [addZip, selectedService]);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Successo!',
          description: state.message,
        });
        formRef.current?.reset();
        setAddZip(false);
        setSelectedService('basic');
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
      
      <input type="hidden" name="sweatshirtType" value={sweatshirtType} />
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {currentSweatshirt.image && (
              <Image
                src={currentSweatshirt.image.imageUrl}
                alt={currentSweatshirt.image.description}
                data-ai-hint={currentSweatshirt.image.imageHint}
                width={80}
                height={80}
                className="rounded-md aspect-square object-cover"
              />
            )}
            <div className="flex-grow">
              <p className="font-semibold text-lg">{sweatshirtOptions.default.name}</p>
              <p className="text-xl font-bold text-primary">€{sweatshirtOptions.default.price.toFixed(2)}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <Label htmlFor="add-zip" className="flex flex-col gap-1">
              <span className="font-semibold">Aggiungi Zip (+€{(sweatshirtOptions.zip.price - sweatshirtOptions.default.price).toFixed(2)})</span>
              <span className="text-sm text-muted-foreground">Trasforma in felpa con cerniera.</span>
            </Label>
            <Switch id="add-zip" checked={addZip} onCheckedChange={setAddZip} />
          </div>
        </CardContent>
      </Card>
      {state.errors?.sweatshirtType && <p className="text-sm font-medium text-destructive">{state.errors.sweatshirtType}</p>}

      <div>
        <Label className="text-lg font-semibold mb-2 block">Scegli il servizio</Label>
        <RadioGroup name="serviceType" value={selectedService} onValueChange={(value) => setSelectedService(value as ServiceType)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(serviceOptions).map((option) => (
            <div key={option.type}>
              <RadioGroupItem value={option.type} id={option.type} className="sr-only" />
              <Label htmlFor={option.type}>
                <Card className={cn("cursor-pointer hover:border-primary transition-colors h-full", selectedService === option.type && "border-primary ring-2 ring-primary")}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Briefcase className="w-5 h-5" />
                      {option.name}
                    </CardTitle>
                  </CardHeader>
                   <CardContent className="space-y-2">
                      <p className="text-2xl font-bold text-primary">+€{option.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{option.description}</span>
                      </p>
                   </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
        {state.errors?.serviceType && <p className="text-sm font-medium text-destructive">{state.errors.serviceType}</p>}
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
