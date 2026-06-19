import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Search() {
  const [query, setQuery] = useState("");

  const quickLinks = [
    { name: "Schools", path: "/schools" },
    { name: "Medical Stores", path: "/medical" },
    { name: "Shops", path: "/shops" },
    { name: "Bus Timetable", path: "/buses" },
    { name: "Buy & Sell", path: "/buy-sell" },
    { name: "Jobs", path: "/jobs" },
    { name: "Events", path: "/events" },
    { name: "Notices", path: "/notices" },
    { name: "Emergency Contacts", path: "/emergency" },
  ];

  const filteredLinks = quickLinks.filter((link) =>
    link.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          className="pl-12 h-14 text-lg rounded-xl shadow-sm"
          placeholder="Search Bhaleri Online..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      <div className="space-y-4">
        <h2 className="font-semibold text-muted-foreground px-1">
          {query ? "Search Results" : "Quick Links"}
        </h2>
        <div className="grid gap-3">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-transparent hover:border-border shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium text-lg">{link.name}</span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
