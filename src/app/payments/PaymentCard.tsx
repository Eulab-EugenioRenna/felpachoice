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
import { User, Phone, Calendar, ShoppingCart, CheckCircle2, Hourglass, FileText, Save, PackageCheck, Package } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { markAsPaid, updateOrderNotes, markAsTaken } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


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


export function PaymentCard({ order, onPaymentUpdate, onNoteUpdate, onTakenUpdate }: { order: Order, onPaymentUpdate: (id: string) => void, onNoteUpdate: (id: string, notes: string) => void, onTakenUpdate: (id: string) => void }) {
  const [createdDate, setCreatedDate] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [takenDate, setTakenDate] = useState('');
  const [notes, setNotes] = useState(order.request.notes ?? '');
  const { toast } = useToast();
  const [isPaying, setIsPaying] = useTransition();
  const [isSavingNotes, setIsSavingNotes] = useTransition();
  const [isTaking, setIsTaking] = useTransition();

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

    if(order.taken && order.taken_at) {
        try {
            const takenDate = new Date(order.taken_at);
            setTakenDate(format(takenDate, "d MMM yyyy 'alle' HH:mm", { locale: it }))
        } catch(e){}
    } else {
        setTakenDate('');
    }
  }, [order.created, order.paid, order.paid_at, order.taken, order.taken_at]);

  useEffect(() => {
    setNotes(order.request.notes ?? '');
  }, [order.request.notes]);


  const handleMarkAsPaid = () => {
    setIsPaying(async () => {
        const result = await markAsPaid(order.id, order.request);
        if (result.success) {
            toast({ title: "Successo!", description: result.message });
            onPaymentUpdate(order.id);
        } else {
            toast({ title: "Errore", description: result.message, variant: "destructive" });
        }
    });
  };

  const handleUpdateNotes = () => {
    setIsSavingNotes(async () => {
        const result = await updateOrderNotes(order.id, order.request, notes);
        if (result.success) {
            toast({ title: "Successo!", description: result.message });
            onNoteUpdate(order.id, notes);
        } else {
            toast({ title: "Errore", description: result.message, variant: "destructive" });
        }
    });
  };
  
  const handleMarkAsTaken = () => {
    setIsTaking(async () => {
        const result = await markAsTaken(order.id);
        if (result.success) {
            toast({ title: "Successo!", description: result.message });
            onTakenUpdate(order.id);
        } else {
            toast({ title: "Errore", description: result.message, variant: "destructive" });
        }
    });
  };


  return (
    <Card className={`flex flex-col h-full shadow-md transition-all duration-300 
      ${order.taken ? 'bg-gray-100 border-gray-200 opacity-80' : 
      order.paid ? 'bg-green-50 border-green-200' : 'bg-card'
    }`}>
      {renderOrderContent(order)}
       <CardContent className="flex-grow">
          <div className="space-y-2">
            <label htmlFor={`notes-${order.id}`} className="flex items-center gap-2 font-semibold">
                <FileText className="w-5 h-5" />
                Note
            </label>
            <Textarea
                id={`notes-${order.id}`}
                placeholder="Aggiungi note sull'ordine..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm"
                disabled={order.taken}
            />
            <Button onClick={handleUpdateNotes} disabled={isSavingNotes || order.taken} size="sm" variant="outline" className="w-full">
                {isSavingNotes ? 'Salvataggio...' : <> <Save className="mr-2 h-4 w-4" /> Aggiorna Nota </>}
            </Button>
          </div>
       </CardContent>
       <Separator className="my-4" />
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {createdDate ? <span>Ordinato il: {createdDate}</span> : <span>Caricamento data...</span>}
            </div>
             {order.taken ? (
                <Badge variant="default" className="bg-gray-500 hover:bg-gray-600">
                    <PackageCheck className="w-4 h-4 mr-1" /> Ritirato
                </Badge>
            ) : order.paid ? (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Pagato
                </Badge>
            ) : (
                 <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                    <Hourglass className="w-4 h-4 mr-1" /> In Attesa
                </Badge>
            )}
        </div>
        
        {order.taken && takenDate && (
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <PackageCheck className="w-4 h-4" />
                <span>Ritirato il: {takenDate}</span>
            </div>
        )}
        
        {order.paid && !order.taken && paidDate && (
             <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pagato il: {paidDate}</span>
            </div>
        )}
        
        <div className="w-full space-y-2">
            {!order.paid && !order.taken && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={isPaying} className="w-full">
                            {isPaying ? 'Attendere...' : 'Segna come Pagato'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Conferma Pagamento</AlertDialogTitle>
                            <AlertDialogDescription>
                                Sei sicuro di voler segnare questo ordine come pagato? L'azione non può essere annullata.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction onClick={handleMarkAsPaid}>
                                Conferma Pagamento
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            {order.paid && !order.taken && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={isTaking} variant="secondary" className="w-full">
                            {isTaking ? 'Attendere...' : 'Segna come Ritirato'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Conferma Ritiro</AlertDialogTitle>
                            <AlertDialogDescription>
                                Sei sicuro di voler segnare questo ordine come ritirato? L'azione non può essere annullata.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction onClick={handleMarkAsTaken}>
                                Conferma Ritiro
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>

      </CardFooter>
    </Card>
  );
}
