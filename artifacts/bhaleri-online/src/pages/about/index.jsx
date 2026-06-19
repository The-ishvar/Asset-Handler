import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Heart, Globe, Code2, Star, Shield, Smartphone, Users } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce inline-block">🏡</div>
        <h1 className="text-4xl font-bold">About Bhaleri</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          भालेरी — एक सुंदर गाँव, जो राजस्थान की पावन धरती पर बसा है
        </p>
      </div>

      {/* Village info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6 hover:shadow-md transition-shadow">
          <CardContent className="pt-4 space-y-2">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Location</h3>
            <p className="text-sm text-muted-foreground">Rajasthan, India — A beautiful village with rich cultural heritage</p>
          </CardContent>
        </Card>
        <Card className="text-center p-6 hover:shadow-md transition-shadow">
          <CardContent className="pt-4 space-y-2">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Community</h3>
            <p className="text-sm text-muted-foreground">A close-knit community built on values, culture, and togetherness</p>
          </CardContent>
        </Card>
        <Card className="text-center p-6 hover:shadow-md transition-shadow">
          <CardContent className="pt-4 space-y-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Digital India</h3>
            <p className="text-sm text-muted-foreground">Connecting Bhaleri to the digital world — one service at a time</p>
          </CardContent>
        </Card>
      </div>

      {/* About the platform */}
      <div className="space-y-4">
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
          <li>Buy &amp; Sell marketplace with photo gallery for Bhaleri residents</li>
          <li>Short video Reels to share moments from the village</li>
          <li>Job listings from local employers — apply directly from the app</li>
          <li>Community events calendar</li>
          <li>Public notices and announcements</li>
          <li>Emergency contacts directory</li>
          <li>Real-time messaging between residents</li>
          <li>Interactive village map</li>
        </ul>
      </div>

      {/* Developer Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code2 className="w-6 h-6 text-indigo-500" /> Developer
        </h2>
        <Card className="overflow-hidden border-2 border-indigo-100 dark:border-indigo-900 hover:shadow-lg transition-shadow">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-white">E</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-card flex items-center justify-center">
                  <Star className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Eshwar Suthar
                  </h3>
                  <p className="text-muted-foreground font-medium mt-0.5">Full-Stack Developer · Bhaleri, Rajasthan</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Designed and developed Bhaleri Online — a complete digital portal for the Bhaleri village community.
                  Passionate about using technology to bridge the digital divide and empower rural communities.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {["React", "Node.js", "PostgreSQL", "Tailwind CSS", "TypeScript"].map((tech) => (
                    <span key={tech} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-full font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center sm:justify-start pt-1">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-500" />
                    <a href="tel:9660585691" className="hover:text-indigo-600 hover:underline font-medium">9660585691</a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>Bhaleri Village</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Super Admin</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 rounded-xl p-6 text-center border border-orange-100 dark:border-orange-900">
        <div className="text-2xl mb-2">🙏</div>
        <p className="text-sm font-medium text-foreground">
          Developed with ❤️ for the Bhaleri Community
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          भालेरी ऑनलाइन — आपका डिजिटल गाँव पोर्टल · © {new Date().getFullYear()}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          By <strong>Eshwar Suthar</strong> · Made in Rajasthan 🇮🇳
        </p>
      </div>
    </div>
  );
}
