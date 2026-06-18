import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, History, TreePine } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Village Landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">About Bhaleri</h1>
          <p className="text-lg text-white/80 max-w-2xl">A vibrant, connected community rooted in tradition while embracing the future.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            Welcome to Bhaleri, a beautiful village that balances its rich cultural heritage with modern amenities. Our community is known for its warm hospitality, hardworking residents, and strong sense of togetherness.
          </p>
          <p>
            Bhaleri Online is our digital initiative to bring the village closer together. Whether you need to check bus timings, find a local plumber, sell a bicycle, or stay updated on the Panchayat notices — everything is now just a click away.
          </p>
          <p>
            This portal belongs to every resident of Bhaleri. It aims to empower local businesses by giving them a digital presence and ensures no villager misses out on important information.
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Location</h3>
                <p className="text-muted-foreground">Situated in the heart of the district, well connected by state highways to major neighboring towns.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Community</h3>
                <p className="text-muted-foreground">A diverse population working in agriculture, local business, education, and services.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">History</h3>
                <p className="text-muted-foreground">Established generations ago, Bhaleri has grown from a small settlement to a thriving modern village hub.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
