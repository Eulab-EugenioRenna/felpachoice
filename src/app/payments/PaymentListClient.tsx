'use client';

import { useState, useMemo, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PaymentCard } from './PaymentCard';
import type { Order } from '@/lib/types';
import { Search, ListFilter, X, Euro, Wallet, PiggyBank, PackageCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type FilterCategory = 'paidStatus' | 'brand' | 'type' | 'size' | 'service';

export default function PaymentListClient({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<FilterCategory, string[]>>({
    paidStatus: [],
    brand: [],
    type: [],
    size: [],
    service: [],
  });

  const handleSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term.toLowerCase());
  }, 300);
  
  const { availableFilters } = useMemo(() => {
    const brandSet = new Set<string>();
    const typeSet = new Set<string>();
    const sizeSet = new Set<string>();
    const serviceSet = new Set<string>();

    initialOrders.forEach(order => {
      if (order.request.items && Array.isArray(order.request.items)) {
        order.request.items.forEach(item => {
          const brand = item.productId.includes('payper') ? 'PAYPER' : 'JHK';
          brandSet.add(brand);
          if (item.category) typeSet.add(item.category);
          if(item.size) sizeSet.add(item.size);
          if(item.service) serviceSet.add(item.service);
        });
      } else { // Legacy
        if(order.request.service) serviceSet.add(order.request.service);
        if(order.request.size) sizeSet.add(order.request.size);
        
        if (order.request.sweatshirtType === 'default') {
          typeSet.add('sweatshirt');
        } else if (order.request.sweatshirtType === 'zip') {
          typeSet.add('jacket');
        }
      }
    });
    
    return {
      availableFilters: {
        paidStatus: ['paid', 'unpaid'],
        brand: Array.from(brandSet).sort(),
        type: Array.from(typeSet).sort(),
        size: Array.from(sizeSet).sort((a,b) => a.localeCompare(b)),
        service: Array.from(serviceSet).sort(),
      },
    };
  }, [initialOrders]);


  const handleFilterChange = (category: FilterCategory, value: string) => {
    setFilters(prev => {
      const newValues = prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value];
      return { ...prev, [category]: newValues };
    });
  };

  const { filteredOrders, activeOrders, takenOrders } = useMemo(() => {
    const filtered = orders.filter(order => {
      const searchMatch = !searchTerm ||
        order.request.name.toLowerCase().includes(searchTerm) ||
        (order.request.phone && order.request.phone.toLowerCase().includes(searchTerm)) ||
        (order.request.items && order.request.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm) ||
          item.service.toLowerCase().includes(searchTerm)
        )) ||
        (order.request.service && order.request.service.toLowerCase().includes(searchTerm));

      if (!searchMatch) return false;
      
      const filterMatch = Object.entries(filters).every(([category, values]) => {
          if (values.length === 0) return true;
          
          const cat = category as FilterCategory;

          if (cat === 'paidStatus') {
            return (values.includes('paid') && order.paid) || (values.includes('unpaid') && !order.paid);
          }

          if (order.request.items && order.request.items.length > 0) {
              return order.request.items.some(item => {
                  if (cat === 'brand') return values.includes(item.productId.includes('payper') ? 'PAYPER' : 'JHK');
                  if (cat === 'type') return values.includes(item.category);
                  if (cat === 'size') return values.includes(item.size);
                  if (cat === 'service') return values.includes(item.service);
                  return false;
              });
          }
          
          // Legacy order format check
          switch(cat) {
              case 'size':
                  return order.request.size ? values.includes(order.request.size) : false;
              case 'service':
                  return order.request.service ? values.includes(order.request.service) : false;
              case 'type':
                  if (order.request.sweatshirtType === 'default' && values.includes('sweatshirt')) return true;
                  if (order.request.sweatshirtType === 'zip' && values.includes('jacket')) return true;
                  return false;
              case 'brand':
                  return false;
              default:
                  return false;
          }
      });

      return filterMatch;

    }).sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return {
        filteredOrders: filtered,
        activeOrders: filtered.filter(o => !o.taken),
        takenOrders: filtered.filter(o => o.taken),
    }
  }, [orders, searchTerm, filters]);

  const { totalAmount, paidAmount, remainingAmount } = useMemo(() => {
    // Financial summary is calculated on all filtered orders, regardless of 'taken' status
    return filteredOrders.reduce((acc, order) => {
      const orderTotal = order.request.total ?? order.request.price ?? 0;
      acc.totalAmount += orderTotal;
      if (order.paid) {
        acc.paidAmount += orderTotal;
      } else {
        acc.remainingAmount += orderTotal;
      }
      return acc;
    }, { totalAmount: 0, paidAmount: 0, remainingAmount: 0 });
  }, [filteredOrders]);


  const activeFilterCount = Object.values(filters).reduce((acc, v) => acc + v.length, 0);

  const clearFilters = () => {
    setFilters({ paidStatus: [], brand: [], type: [], size: [], service: [] });
  };
  
  const handlePaymentUpdate = useCallback((paidOrderId: string) => {
    setOrders(currentOrders => currentOrders.map(o => 
        o.id === paidOrderId ? { ...o, paid: true, paid_at: new Date().toISOString() } : o
    ));
  }, []);

  const handleNoteUpdate = useCallback((orderId: string, newNotes: string) => {
    setOrders(currentOrders => currentOrders.map(o => 
        o.id === orderId ? { ...o, request: { ...o.request, notes: newNotes } } : o
    ));
  }, []);

  const handleTakenUpdate = useCallback((takenOrderId: string) => {
    setOrders(currentOrders => currentOrders.map(o => 
        o.id === takenOrderId ? { ...o, taken: true, taken_at: new Date().toISOString() } : o
    ));
  }, []);

  const handleOrderDelete = useCallback((deletedOrderId: string) => {
    setOrders(currentOrders => currentOrders.filter(o => o.id !== deletedOrderId));
  }, []);

  const handleOrderUpdate = useCallback((updatedOrder: Order) => {
    setOrders(currentOrders => currentOrders.map(o => 
      o.id === updatedOrder.id ? updatedOrder : o
    ));
  }, []);


  const FilterDropdown = ({ category, title, options }: { category: FilterCategory, title: string, options: {label: string, value: string}[] | string[] }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto justify-between h-12">
          <div className="flex items-center">
            {title}
            {filters[category].length > 0 && (
              <Badge variant="secondary" className="ml-2">{filters[category].length}</Badge>
            )}
          </div>
          <ListFilter className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map(option => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          return (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filters[category].includes(value)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => handleFilterChange(category, value)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
            <CardTitle>Filtri e Ricerca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cerca per nome, telefono, articolo..."
                className="pl-10 h-12 w-full"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <FilterDropdown category="paidStatus" title="Stato Pagamento" options={[{label: 'Pagato', value: 'paid'}, {label: 'Non Pagato', value: 'unpaid'}]} />
                <FilterDropdown category="brand" title="Marca" options={availableFilters.brand} />
                <FilterDropdown category="type" title="Tipo" options={availableFilters.type} />
                <FilterDropdown category="size" title="Taglia" options={availableFilters.size} />
                <FilterDropdown category="service" title="Servizio" options={availableFilters.service} />
            </div>
            {activeFilterCount > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{activeFilterCount} filtri attivi</p>
                    <Button variant="ghost" onClick={clearFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Pulisci filtri
                    </Button>
                </div>
              </>
            )}
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Riepilogo Finanziario (basato sui filtri)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
                    <Wallet className="w-5 h-5" />
                    <span>Valore Totale</span>
                </div>
                <p className="text-2xl font-bold">€{totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-green-100/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-lg text-green-700">
                    <PiggyBank className="w-5 h-5" />
                    <span>Totale Incassato</span>
                </div>
                <p className="text-2xl font-bold text-green-800">€{paidAmount.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-amber-100/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-lg text-amber-700">
                    <Euro className="w-5 h-5" />
                    <span>Totale Rimanente</span>
                </div>
                <p className="text-2xl font-bold text-amber-800">€{remainingAmount.toFixed(2)}</p>
            </div>
        </CardContent>
      </Card>

      {activeOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map((order) => (
            <PaymentCard key={order.id} order={order} onPaymentUpdate={handlePaymentUpdate} onNoteUpdate={handleNoteUpdate} onTakenUpdate={handleTakenUpdate} onOrderDelete={handleOrderDelete} onOrderUpdate={handleOrderUpdate}/>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg mb-8">
          <p className="text-muted-foreground">Nessun ordine attivo trovato.</p>
          <p className="text-sm text-muted-foreground">
            Tutti gli ordini sono stati ritirati o i filtri non producono risultati.
          </p>
        </div>
      )}

      {takenOrders.length > 0 && (
          <Accordion type="single" collapsible className="w-full mt-8">
              <AccordionItem value="item-1">
                  <AccordionTrigger>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <PackageCheck className="w-6 h-6" />
                        Ordini Ritirati ({takenOrders.length})
                      </h2>
                  </AccordionTrigger>
                  <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                          {takenOrders.map((order) => (
                              <PaymentCard key={order.id} order={order} onPaymentUpdate={handlePaymentUpdate} onNoteUpdate={handleNoteUpdate} onTakenUpdate={handleTakenUpdate} onOrderDelete={handleOrderDelete} onOrderUpdate={handleOrderUpdate} />
                          ))}
                      </div>
                  </AccordionContent>
              </AccordionItem>
          </Accordion>
      )}

    </div>
  );
}

    