import { MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const landmarks = [
  { name: "Bhaleri Village Center", type: "Village" },
  { name: "Government Primary School", type: "School" },
  { name: "Primary Health Centre", type: "Medical" },
  { name: "Bus Stop", type: "Transport" },
  { name: "Gram Panchayat Office", type: "Government" },
  { name: "Main Market", type: "Market" },
];

export default function VillageMap() {
  const BHALERI_LAT = 29.1234;
  const BHALERI_LNG = 75.5678;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${BHALERI_LNG - 0.04}%2C${BHALERI_LAT - 0.02}%2C${BHALERI_LNG + 0.04}%2C${BHALERI_LAT + 0.02}&layer=mapnik&marker=${BHALERI_LAT}%2C${BHALERI_LNG}`;
  const fullMapUrl = `https://www.openstreetmap.org/?mlat=${BHALERI_LAT}&mlon=${BHALERI_LNG}#map=14/${BHALERI_LAT}/${BHALERI_LNG}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <MapPin className="w-8 h-8 text-primary" />
          Village Map
        </h1>
        <p className="text-muted-foreground mt-2">
          Explore Bhaleri village — find important places and local landmarks.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden border border-border shadow-md">
        <iframe
          src={mapSrc}
          className="w-full h-[400px] md:h-[500px]"
          title="Bhaleri Village Map"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <a href={fullMapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Open in OpenStreetMap
          </a>
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Important Landmarks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {landmarks.map((place) => (
            <Card key={place.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">{place.name}</div>
                  <div className="text-xs text-muted-foreground">{place.type}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
