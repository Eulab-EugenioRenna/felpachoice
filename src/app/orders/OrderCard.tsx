import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderItem } from '@/lib/types';
import { Shirt, User, Phone, Calendar, Tag, Briefcase, Ruler, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const renderLegacyOrder = (order: Order) => {
  const { name, phone, sweatshirtType, size, service, price } = order.request;
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
             <Badge variant={sweatshirtType === 'default' ? 'secondary' : 'default'} className="whitespace-nowrap">
                {sweatshirtType === 'default' ? 'Felpa' : 'Felpa+Giacca'}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shirt className="w-4 h-4" />
            <span>Tipo Felpa: <span className="font-semibold text-foreground">{sweatshirtType === 'default' ? 'Felpa Ufficiale' : 'Felpa Ufficiale + Giacca'}</span></span>
        </div>
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ruler className="w-4 h-4" />
            <span>Taglia: <span className="font-semibold text-foreground">{size}</span></span>
        </div>
        {service && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                  <span>Servizio Svolto:</span>
                  <p className="font-semibold text-foreground">{service}</p>
              </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="w-4 h-4" />
            <span>Prezzo Totale: <span className="font-semibold text-foreground">€{price?.toFixed(2) ?? 'N/A'}</span></span>
        </div>
      </CardContent>
    </>
  );
};


const renderNewOrder = (order: Order) => {
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
                        <p className="text-2xl font-bold text-primary">€{total?.toFixed(2) ?? 'N/A'}</p>
                        <Badge variant="secondary">{items?.length} {items?.length === 1 ? 'articolo' : 'articoli'}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                    <ShoppingCart className="w-5 h-5" />
                    Dettagli Articoli
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm p-2 border-l-4 border-accent rounded-r-md bg-muted/50">
                            <div>
                                <p className="font-semibold">{item.productName} (x{item.quantity})</p>
                                <p className="text-muted-foreground">Taglia: {item.size}, Servizio: {item.service}</p>
                            </div>
                            <p className="font-medium whitespace-nowrap">€{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </>
    );
};


export function OrderCard({ order }: { order: Order }) {
  const orderDate = new Date(order.created);
  const isNewOrderFormat = order.request.items && Array.isArray(order.request.items);

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-xl transition-shadow duration-300">
      {isNewOrderFormat ? renderNewOrder(order) : renderLegacyOrder(order)}
      <CardFooter>
        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
            <Calendar className="w-4 h-4" />
            <span>Ordinato il: {format(orderDate, "d MMMM yyyy 'alle' HH:mm", { locale: it })}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
