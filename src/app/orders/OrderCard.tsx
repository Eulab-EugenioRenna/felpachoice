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
import { Shirt, User, Phone, Calendar, Tag, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export function OrderCard({ order }: { order: Order }) {
  const { name, phone, sweatshirtType, service, price } = order.request;
  const orderDate = new Date(order.created);

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-xl transition-shadow duration-300">
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
        {service && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                  <span>Servizio Richiesto:</span>
                  <p className="font-semibold text-foreground">{service}</p>
              </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="w-4 h-4" />
            <span>Prezzo Totale: <span className="font-semibold text-foreground">€{price.toFixed(2)}</span></span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
            <Calendar className="w-4 h-4" />
            <span>Ordinato il: {format(orderDate, "d MMMM yyyy 'alle' HH:mm", { locale: it })}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
