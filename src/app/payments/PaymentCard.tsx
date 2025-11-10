'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { User, Phone, Calendar, ShoppingCart, CheckCircle2, Hourglass } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { markAsPaid } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';


const renderOrderContent = (order: Order) => {
    const { name, phone, items, total } = order.request;
    return (
        <>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <User className="w-5 h-5 text-primary" />
                            {name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {phone}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">€{total?.toFixed(2) ?? order.request.price?.toFixed(2) ?? 'N/A'}</p>
                        <Badge variant="secondary">{items?.length ?? 1} {items?.length === 1 ? 'articolo' : 'articoli'}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                 <div className="flex items-center gap-2 font-semibold">
                    <ShoppingCart className="w-5 h-5" />
                    Dettagli Articoli
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {items && items.length > 0 ? (
                        items.map((item, index) => (
                            <div key={index} className="flex justify-between items-start text-sm p-2 border-l-4 border-accent rounded-r-md bg-muted/50">
                                <div>
                                    <p className="font-semibold">{item.productName} (x{item.quantity})</p>
                                    <p className="text-muted-foreground">Taglia: {item.size}, Servizio: {item.service}</p>
                                </div>
                                <p className="font-medium whitespace-nowrap">€{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))
                    ) : (
                         <div className="flex justify-between items-start text-sm p-2 border-l-4 border-accent rounded-r-md bg-muted/50">
                            <div>
                                <p className="font-semibold">{order.request.sweatshirtType === 'default' ? 'Felpa' : 'Giacca'} (x1)</p>
                                <p className="text-muted-foreground">Taglia: {order.request.size}, Servizio: {order.request.service}</p>
                            </div>
                            <p className="font-medium whitespace-nowrap">€{order.request.price?.toFixed(2)}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </>
    );
};


export function PaymentCard({ order, onPaymentUpdate }: { order: Order, onPaymentUpdate: () => void }) {
  const [createdDate, setCreatedDate] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    try {
        const orderDate = new Date(order.created);
        setCreatedDate(format(orderDate, "d MMM yyyy 'alle' HH:mm", { locale: it }));
    } catch (e) {}

    if(order.paid && order.paid_at) {
        try {
            const paymentDate = new Date(order.paid_at);
            setPaidDate(format(paymentDate, "d MMM yyyy 'alle' HH:mm", { locale: it }))
        } catch(e){}
    } else {
        setPaidDate('');
    }
  }, [order.created, order.paid, order.paid_at]);

  const handleMarkAsPaid = async () => {
    setIsPending(true);
    const result = await markAsPaid(order.id);
    if (result.success) {
      toast({ title: "Successo!", description: result.message });
      onPaymentUpdate(); // This will trigger a re-render in parent to update state
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" });
    }
    setIsPending(false);
  };

  return (
    <Card className={`flex flex-col h-full shadow-md transition-all duration-300 ${order.paid ? 'bg-green-50 border-green-200' : 'bg-card'}`}>
      {renderOrderContent(order)}
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {createdDate ? <span>Ordinato il: {createdDate}</span> : <span>Caricamento data...</span>}
            </div>
            {order.paid ? (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Pagato
                </Badge>
            ) : (
                 <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                    <Hourglass className="w-4 h-4 mr-1" /> In Attesa
                </Badge>
            )}
        </div>
        
        {order.paid && paidDate && (
             <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pagato il: {paidDate}</span>
            </div>
        )}
        
        {!order.paid && (
            <Button onClick={handleMarkAsPaid} disabled={isPending} className="w-full">
                {isPending ? 'Attendere...' : 'Segna come Pagato'}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
