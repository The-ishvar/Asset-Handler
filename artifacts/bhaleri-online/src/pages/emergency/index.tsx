import { useListEmergency } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Phone, Stethoscope, Truck, ShieldAlert, Zap, Flame, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function EmergencyList() {
  const { data: contacts, isLoading, error } = useListEmergency();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Emergency Contacts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Failed to load emergency contacts.</div>;
  }

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "hospital": return { icon: Stethoscope, color: "text-red-600", bg: "bg-red-100" };
      case "ambulance": return { icon: Truck, color: "text-red-500", bg: "bg-red-50" };
      case "police": return { icon: ShieldAlert, color: "text-blue-600", bg: "bg-blue-100" };
      case "electricity": return { icon: Zap, color: "text-yellow-600", bg: "bg-yellow-100" };
      case "fire": return { icon: Flame, color: "text-orange-600", bg: "bg-orange-100" };
      case "other": 
      default: return { icon: Info, color: "text-slate-600", bg: "bg-slate-100" };
    }
  };

  // Group by category
  const groupedContacts = contacts?.reduce((acc, contact) => {
    const cat = contact.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(contact);
    return acc;
  }, {} as Record<string, typeof contacts>);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 md:p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-red-700 mb-2">Emergency Contacts</h1>
        <p className="text-red-600/80">Immediate assistance numbers for Bhaleri residents. Save these for emergencies.</p>
      </div>

      {!contacts?.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No emergency contacts listed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedContacts || {}).map(([category, items]) => {
            const config = getCategoryConfig(category);
            const Icon = config.icon;
            
            return (
              <div key={category} className="space-y-4">
                <h2 className="text-xl font-semibold capitalize flex items-center gap-2 pb-2 border-b">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  {category}
                </h2>
                <div className="space-y-3">
                  {items.map(contact => (
                    <Card key={contact.id} className="overflow-hidden border-none shadow-sm ring-1 ring-border">
                      <div className="flex items-stretch h-full">
                        <div className={`${config.bg} p-4 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <div className="p-4 flex-1 flex justify-between items-center bg-card">
                          <div>
                            <div className="font-bold">{contact.name}</div>
                            {contact.description && (
                              <div className="text-xs text-muted-foreground mt-1">{contact.description}</div>
                            )}
                          </div>
                          <Button variant="secondary" className="font-bold tracking-wider shrink-0 ml-4" asChild>
                            <a href={`tel:${contact.contactNumber}`}>
                              <Phone className="w-4 h-4 mr-2" />
                              {contact.contactNumber}
                            </a>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
