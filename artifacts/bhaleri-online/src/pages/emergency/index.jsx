import { useListEmergency } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FIXED_CONTACTS = [
  { name: "Police", number: "100", description: "Emergency Police Helpline", color: "bg-blue-500" },
  { name: "Ambulance", number: "108", description: "Emergency Ambulance", color: "bg-red-500" },
  { name: "Fire Brigade", number: "101", description: "Fire Emergency", color: "bg-orange-500" },
  { name: "Women Helpline", number: "1091", description: "Women Safety Helpline", color: "bg-pink-500" },
];

export default function EmergencyList() {
  const { data: contacts, isLoading } = useListEmergency();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500 text-white rounded-full"><AlertTriangle className="w-7 h-7" /></div>
        <div>
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Emergency Contacts</h1>
          <p className="text-muted-foreground">Quick access to emergency services</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FIXED_CONTACTS.map((c) => (
          <a key={c.number} href={`tel:${c.number}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-red-300">
              <CardContent className="p-5 text-center space-y-2">
                <div className={`w-14 h-14 ${c.color} rounded-full flex items-center justify-center mx-auto`}>
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <div className="font-bold text-2xl text-red-600 dark:text-red-400">{c.number}</div>
                <div className="font-semibold text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.description}</div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Local Emergency Contacts</h2>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
        ) : !contacts?.length ? (
          <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed">
            <p className="text-muted-foreground text-sm">No local emergency contacts listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contacts.map((contact) => (
              <Card key={contact.id} className="border-red-100 dark:border-red-950">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-red-100 dark:bg-red-950 p-3 rounded-full shrink-0">
                    <Phone className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{contact.name}</div>
                    {contact.description && <div className="text-xs text-muted-foreground">{contact.description}</div>}
                  </div>
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="text-red-600 dark:text-red-400 font-bold text-sm hover:underline shrink-0">{contact.phone}</a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
