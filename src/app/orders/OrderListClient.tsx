'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OrderCard } from './OrderCard';
import type { Order, SweatshirtType } from '@/lib/types';
import { Search, ListFilter, Briefcase, Ruler } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


export default function OrderListClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type');

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFilterChange = (type: SweatshirtType | 'all') => {
    const params = new URLSearchParams(searchParams);
    if (type === 'all') {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const serviceSummary = orders.reduce((acc, order) => {
    const service = order.request.service || 'Nessuno';
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sizeSummary = orders.reduce((acc, order) => {
    const size = order.request.size;
    acc[size] = (acc[size] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                      <Briefcase className="w-5 h-5" />
                      Riepilogo Servizi
                  </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                  {Object.entries(serviceSummary).map(([service, count]) => (
                      <Badge key={service} variant="secondary" className="text-base">
                          {service}: {count}
                      </Badge>
                  ))}
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                      <Ruler className="w-5 h-5" />
                      Riepilogo Taglie
                  </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                   {Object.entries(sizeSummary).map(([size, count]) => (
                      <Badge key={size} variant="secondary" className="text-base">
                          {size}: {count}
                      </Badge>
                  ))}
              </CardContent>
          </Card>
      </div>


      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cerca per nome, telefono o servizio..."
            className="pl-10 h-12 w-full"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get('search')?.toString()}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="hidden md:block text-sm font-medium text-muted-foreground">Filtra per:</span>
          <div className="flex-grow md:flex-grow-0">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto justify-between h-12">
                  <span>{currentType === 'default' ? 'Felpa Ufficiale' : currentType === 'zip' ? 'Felpa + Giacca' : 'Tutti i tipi'}</span>
                  <ListFilter className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Tipo di Felpa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={currentType || 'all'} onValueChange={(value) => handleFilterChange(value as SweatshirtType | 'all')}>
                  <DropdownMenuRadioItem value="all">Tutti</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="default">Felpa Ufficiale</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="zip">Felpa + Giacca</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Nessun ordine trovato.</p>
          <p className="text-sm text-muted-foreground">
            Prova a modificare i filtri o il termine di ricerca.
          </p>
        </div>
      )}
    </div>
  );
}
