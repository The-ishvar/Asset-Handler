import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Heart, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <div className="text-5xl mb-4">🏡</div>
        <h1 className="text-4xl font-bold mb-3">About Bhaleri</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          भालेरी — एक सुंदर गाँव, जो राजस्थान की पावन धरती पर बसा है
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <CardContent className="pt-4 space-y-2">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Location</h3>
            <p className="text-sm text-muted-foreground">Rajasthan, India — A beautiful village with rich cultural heritage</p>
          </CardContent>
        </Card>
        <Card className="text-center p-6">
          <CardContent className="pt-4 space-y-2">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Community</h3>
            <p className="text-sm text-muted-foreground">A close-knit community built on values, culture, and togetherness</p>
          </CardContent>
        </Card>
        <Card className="text-center p-6">
          <CardContent className="pt-4 space-y-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Digital India</h3>
            <p className="text-sm text-muted-foreground">Connecting Bhaleri to the digital world — one service at a time</p>
          </CardContent>
        </Card>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold">About Bhaleri Online</h2>
        <p className="text-muted-foreground leading-relaxed">
          Bhaleri Online is a digital village portal designed to serve the people of Bhaleri, Rajasthan.
          Our platform brings together local services, business listings, community updates, and emergency
          contacts — all in one place.
        </p>
        <h3 className="text-xl font-semibold mt-6">Our Mission</h3>
        <p className="text-muted-foreground leading-relaxed">
          To empower Bhaleri's residents with easy access to local information, facilitate community
          commerce through our Buy &amp; Sell marketplace, and strengthen connections through
          social features like Reels, messaging, and community notices.
        </p>
        <h3 className="text-xl font-semibold mt-6">Features</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Complete directory of local schools, hospitals, shops</li>
          <li>Buy &amp; Sell marketplace for Bhaleri residents</li>
          <li>Short video Reels to share moments from the village</li>
          <li>Job listings from local employers</li>
          <li>Community events calendar</li>
          <li>Public notices and announcements</li>
          <li>Emergency contacts directory</li>
          <li>Real-time messaging between residents</li>
          <li>Interactive village map</li>
        </ul>
      </div>

      <div className="bg-muted/30 rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Developed with ❤️ for the Bhaleri Community · Bhaleri Online © {new Date().getFullYear()}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          भालेरी ऑनलाइन — आपका डिजिटल गाँव पोर्टल
        </p>
      </div>
    </div>
  );
}
