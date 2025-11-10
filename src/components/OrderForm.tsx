'use client';

import { useEffect, useRef, useActionState, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Loader2, User, Phone, ShoppingCart, XCircle, PlusCircle, Trash2 } from 'lucide-react';
import { submitOrder, type State } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OrderItem, Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const products: Product[] = [
    {
      id: 'jhk-sweatshirt',
      name: 'Felpa Ufficiale - JHK',
      price: 12,
      imageUrl: '/images/default-sweatshirt.png',
      imageHint: 'green sweatshirt',
      category: 'sweatshirt',
    },
    {
      id: 'payper-sweatshirt',
      name: 'Felpa Ufficiale - PAYPER',
      price: 15,
      imageUrl: '/images/default-sweatshirt.png',
      imageHint: 'green sweatshirt',
      category: 'sweatshirt',
    },
    {
      id: 'payper-jacket',
      name: 'Giacca Ufficiale - PAYPER',
      price: 28,
      imageUrl: '/images/zip-sweatshirt.png',
      imageHint: 'zip sweatshirt',
      category: 'jacket',
    },
];

const services = ['media', 'welcome', 'security', 'kids', 'none'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<OrderItem>>({
    productId: 'jhk-sweatshirt',
    quantity: 1,
    size: 'M',
    service: 'none',
  });

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === currentItem.productId);
  }, [currentItem.productId]);

  const currentImage = useMemo(() => {
    if (!selectedProduct) return null;

    const service = currentItem.service;
    if (service && service !== 'none') {
      const category = selectedProduct.category === 'jacket' ? 'zip' : 'default';
      const imageKey = `${category}-${service}`;
      const serviceImage = PlaceHolderImages.find(img => img.id === imageKey);
      if (serviceImage) {
        return serviceImage;
      }
    }
    
    return {
        imageUrl: selectedProduct.imageUrl,
        imageHint: selectedProduct.imageHint,
        description: selectedProduct.name,
    };
  }, [currentItem.service, selectedProduct]);


  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const handleAddOrUpdateItem = () => {
    const product = products.find(p => p.id === currentItem.productId);
    if (!product || !currentItem.size || !currentItem.service || !currentItem.quantity) {
        toast({ title: "Campi incompleti", description: "Seleziona prodotto, taglia, servizio e quantità.", variant: "destructive"});
        return;
    }

    const newItem: OrderItem = {
      ...currentItem,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: currentItem.quantity,
      size: currentItem.size,
      service: currentItem.service,
    };
    
    setOrderItems([...orderItems, newItem]);
    setShowItemForm(false);
    setCurrentItem({ productId: 'jhk-sweatshirt', quantity: 1, size: 'M', service: 'none' });
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };
  
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Successo!',
          description: state.message,
        });
        formRef.current?.reset();
        setOrderItems([]);
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
       {/* Hidden input to pass orderItems to server action */}
      <input type="hidden" name="orderItems" value={JSON.stringify(orderItems)} />
      
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
      
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    Articoli Ordine
                  </div>
                   <Button type="button" size="sm" variant="outline" onClick={() => setShowItemForm(!showItemForm)}>
                      {showItemForm ? <XCircle className="mr-2"/> : <PlusCircle className="mr-2" />}
                      {showItemForm ? 'Annulla' : 'Aggiungi Articolo'}
                  </Button>
              </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showItemForm && (
                <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                    {currentImage && (
                        <div className="flex justify-center my-4">
                            <Image
                                src={currentImage.imageUrl}
                                alt={currentImage.description}
                                width={200}
                                height={200}
                                className="h-48 w-auto object-contain transition-all duration-300"
                                data-ai-hint={currentImage.imageHint}
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="product" className="font-semibold mb-2 block">Prodotto</Label>
                          <Select
                              name="product"
                              value={currentItem.productId}
                              onValueChange={(value) => setCurrentItem(prev => ({...prev, productId: value}))}
                          >
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Seleziona un prodotto" />
                              </SelectTrigger>
                              <SelectContent>
                                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - €{p.price.toFixed(2)}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                       <div>
                          <Label htmlFor="quantity" className="font-semibold mb-2 block">Quantità</Label>
                          <Input
                              id="quantity"
                              type="number"
                              min="1"
                              value={currentItem.quantity}
                              onChange={(e) => setCurrentItem(prev => ({...prev, quantity: parseInt(e.target.value, 10) || 1}))}
                              className="h-12"
                           />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="size-current" className="font-semibold mb-2 block">Taglia</Label>
                            <Select name="size-current" value={currentItem.size} onValueChange={(value) => setCurrentItem(prev => ({...prev, size: value}))}>
                                <SelectTrigger className="h-12">
                                <SelectValue placeholder="Seleziona una taglia" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="service-current" className="font-semibold mb-2 block">Servizio Svolto</Label>
                            <Select name="service-current" value={currentItem.service} onValueChange={(value) => setCurrentItem(prev => ({...prev, service: value}))}>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Seleziona un servizio" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <Button type="button" onClick={handleAddOrUpdateItem} className="w-full">Aggiungi al Carrello</Button>
                </div>
            )}
             
            <div className="space-y-2">
                {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-background">
                       <div className="flex-grow">
                          <p className="font-semibold">{item.productName} (x{item.quantity})</p>
                          <p className="text-sm text-muted-foreground">Taglia: {item.size}, Servizio: {item.service}</p>
                       </div>
                       <div className="flex items-center gap-4">
                           <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                           <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                           </Button>
                       </div>
                    </div>
                ))}
                {orderItems.length === 0 && !showItemForm && (
                     <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Il carrello è vuoto.</p>
                        <p className="text-sm text-muted-foreground">
                            Clicca su "Aggiungi Articolo" per iniziare.
                        </p>
                    </div>
                )}
            </div>

            {state.errors?.orderItems && <p className="text-sm font-medium text-destructive">{state.errors.orderItems}</p>}
          </CardContent>
      </Card>
      
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
