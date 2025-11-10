'use client';

import { useState, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OrderCard } from './OrderCard';
import type { Order } from '@/lib/types';
import { Search, ListFilter, Briefcase, Ruler, X } from 'lucide-react';
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

type FilterCategory = 'brand' | 'type' | 'size' | 'service';

export default function OrderListClient({ orders: initialOrders }: { orders: Order[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<FilterCategory, string[]>>({
    brand: [],
    type: [],
    size: [],
    service: [],
  });

  const handleSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term.toLowerCase());
  }, 300);

  const { availableFilters, serviceSummary, sizeSummary } = useMemo(() => {
    const brandSet = new Set<string>();
    const typeSet = new Set<string>();
    const sizeSet = new Set<string>();
    const serviceSet = new Set<string>();
    
    const serviceSummary: Record<string, number> = {};
    const sizeSummary: Record<string, number> = {};

    initialOrders.forEach(order => {
      if (order.request.items && Array.isArray(order.request.items)) {
        order.request.items.forEach(item => {
          const brand = item.productId.includes('payper') ? 'PAYPER' : 'JHK';
          brandSet.add(brand);
          typeSet.add(item.category);
          sizeSet.add(item.size);
          serviceSet.add(item.service);
          
          serviceSummary[item.service] = (serviceSummary[item.service] || 0) + item.quantity;
          sizeSummary[item.size] = (sizeSummary[item.size] || 0) + item.quantity;
        });
      } else { // Legacy
        if(order.request.service) serviceSet.add(order.request.service);
        if(order.request.size) sizeSet.add(order.request.size);
        
        if (order.request.service) serviceSummary[order.request.service] = (serviceSummary[order.request.service] || 0) + 1;
        if (order.request.size) sizeSummary[order.request.size] = (sizeSummary[order.request.size] || 0) + 1;
        
        if(order.request.sweatshirtType === 'default') typeSet.add('sweatshirt');
        else if(order.request.sweatshirtType === 'zip') typeSet.add('jacket');

      }
    });
    
    return {
      availableFilters: {
        brand: Array.from(brandSet).sort(),
        type: Array.from(typeSet).sort(),
        size: Array.from(sizeSet).sort((a,b) => a.localeCompare(b)),
        service: Array.from(serviceSet).sort(),
      },
      serviceSummary,
      sizeSummary,
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

  const filteredOrders = useMemo(() => {
    return initialOrders.filter(order => {
      const searchMatch = !searchTerm ||
        order.request.name.toLowerCase().includes(searchTerm) ||
        (order.request.phone && order.request.phone.toLowerCase().includes(searchTerm)) ||
        (order.request.items && order.request.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm) ||
          item.service.toLowerCase().includes(searchTerm)
        )) ||
        (order.request.service && order.request.service.toLowerCase().includes(searchTerm));

      if (!searchMatch) return false;

      // Check if order matches active filters
      const filterMatch = Object.entries(filters).every(([category, values]) => {
        if (values.length === 0) return true;
        
        // New order format with items array
        if (order.request.items && order.request.items.length > 0) {
            return order.request.items.some(item => {
                if (category === 'brand') return values.includes(item.productId.includes('payper') ? 'PAYPER' : 'JHK');
                if (category === 'type') return values.includes(item.category);
                if (category === 'size') return values.includes(item.size);
                if (category === 'service') return values.includes(item.service);
                return false; // Should not happen
            });
        }
        
        // Legacy order format check
        const cat = category as FilterCategory;
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
                // Legacy orders don't have brand info, so they don't match if brand filter is active
                return false;
            default:
                return false;
        }
      });

      return filterMatch;
    });
  }, [initialOrders, searchTerm, filters]);

  const activeFilterCount = Object.values(filters).reduce((acc, v) => acc + v.length, 0);

  const clearFilters = () => {
    setFilters({ brand: [], type: [], size: [], service: [] });
  };

  const FilterDropdown = ({ category, title, options }: { category: FilterCategory, title: string, options: string[] }) => (
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
        {options.map(option => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={filters[category].includes(option)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => handleFilterChange(category, option)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
                  {Object.entries(serviceSummary).sort(([a], [b]) => a.localeCompare(b)).map(([service, count]) => (
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
                   {Object.entries(sizeSummary).sort(([a], [b]) => a.localeCompare(b)).map(([size, count]) => (
                      <Badge key={size} variant="secondary" className="text-base">
                          {size}: {count}
                      </Badge>
                  ))}
              </CardContent>
          </Card>
      </div>

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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


      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
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
