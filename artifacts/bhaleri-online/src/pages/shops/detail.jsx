import { useRoute, Link } from "wouter";
import { useGetShop } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Store, MapPin, Phone, Clock, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ShopDetail() {
  const [, params] = useRoute("/shops/:id");
  const { data: shop, isLoading, error } = useGetShop(Number(params?.id), { enabled: !!params?.id });

  if (isLoading) return <div className="max-w-2xl mx-auto space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-48 w-full" /></div>;
  if (error || !shop) return <div className="text-center py-10 text-destructive">Shop not found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/shops"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-2xl font-bold">{shop.name}</h1>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 text-green-600 rounded-full"><Store className="w-7 h-7" /></div>
            <div>
              <div className="font-bold text-xl">{shop.name}</div>
              {shop.type && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{shop.type}</span>}
            </div>
          </div>
          {shop.description && <p className="text-muted-foreground">{shop.description}</p>}
          <div className="grid gap-3">
            {shop.address && <div className="flex items-start gap-3 text-sm"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" /><span>{shop.address}</span></div>}
            {shop.phone && <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground shrink-0" /><a href={`tel:${shop.phone}`} className="text-primary hover:underline">{shop.phone}</a></div>}
            {shop.timing && <div className="flex items-center gap-3 text-sm"><Clock className="w-4 h-4 text-muted-foreground shrink-0" /><span>{shop.timing}</span></div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
