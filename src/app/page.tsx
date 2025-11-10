import { OrderForm } from '@/components/OrderForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto py-8 md:py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Crea un nuovo ordine
            </CardTitle>
            <CardDescription className="mt-2 text-lg leading-8 text-muted-foreground">
              Scegli la tua felpa e compila i tuoi dati.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
