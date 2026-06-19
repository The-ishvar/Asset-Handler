import { MapPin, School, Stethoscope, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VillageMap() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 text-teal-600">
          <MapPin className="w-8 h-8" /> Village Map
        </h1>
        <p className="text-muted-foreground mt-2">Explore Bhaleri village locations</p>
      </div>

      <div className="w-full aspect-video rounded-xl overflow-hidden border shadow-md">
        <iframe
          title="Bhaleri Village Map"
          className="w-full h-full"
          src="https://maps.google.com/maps?q=Bhaleri,Rajasthan,India&t=&z=13&ie=UTF8&iwloc=&output=embed"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-600 text-base">
              <School className="w-5 h-5" /> Schools
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>Government Primary School, Bhaleri</p>
            <p>Government Middle School, Bhaleri</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-600 text-base">
              <Stethoscope className="w-5 h-5" /> Medical
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>Primary Health Centre, Bhaleri</p>
            <p>Medical Store, Main Market</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-green-600 text-base">
              <Store className="w-5 h-5" /> Shops
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>Main Market, Bhaleri</p>
            <p>Grocery & General Stores</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>📍 Bhaleri, Rajasthan, India</p>
        <p className="mt-1">Coordinates: 27.0° N, 75.5° E (approx)</p>
      </div>
    </div>
  );
}
