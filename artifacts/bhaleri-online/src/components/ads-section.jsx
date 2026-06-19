import { useState } from "react";
import { ExternalLink, X, Megaphone } from "lucide-react";

const ADS = [
  {
    id: 1,
    title: "Suthar Hardware Store",
    subtitle: "Building Materials & Tools",
    description: "सभी प्रकार की निर्माण सामग्री, दरवाजे, खिड़कियाँ और हार्डवेयर उपकरण",
    phone: "9660585691",
    badge: "🏪 Local Shop",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-800",
    textAccent: "text-orange-700 dark:text-orange-400",
  },
  {
    id: 2,
    title: "Bhaleri Kirana & General Store",
    subtitle: "Daily Essentials at Best Prices",
    description: "किराना सामान, दूध, सब्जियाँ और घर का हर जरूरी सामान। होम डिलीवरी उपलब्ध।",
    phone: "9876543210",
    badge: "🛒 Grocery",
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    textAccent: "text-green-700 dark:text-green-400",
  },
  {
    id: 3,
    title: "Village Tailoring & Fashion",
    subtitle: "Custom Stitching & Alterations",
    description: "शादी, त्यौहार और हर मौके के लिए कपड़े सिलवाएं। नई डिज़ाइन, किफायती दाम।",
    phone: "9090909090",
    badge: "✂️ Tailoring",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200 dark:border-pink-800",
    textAccent: "text-pink-700 dark:text-pink-400",
  },
];

export default function AdsSection({ max = 2, title = "Local Advertisements" }) {
  const [dismissed, setDismissed] = useState([]);
  const visible = ADS.filter((a) => !dismissed.includes(a.id)).slice(0, max);
  if (!visible.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Megaphone className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wide font-semibold">{title}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((ad) => (
          <div
            key={ad.id}
            className={`relative rounded-xl border p-4 ${ad.bg} ${ad.border} group overflow-hidden transition-shadow hover:shadow-md`}
          >
            {/* Decorative blob */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${ad.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

            <button
              onClick={() => setDismissed((d) => [...d, ad.id])}
              className="absolute top-2 right-2 text-muted-foreground/60 hover:text-muted-foreground p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30 ${ad.textAccent}`}>
                  {ad.badge}
                </span>
                <span className="text-xs text-muted-foreground">Ad</span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">{ad.title}</h4>
                <p className={`text-xs font-medium mt-0.5 ${ad.textAccent}`}>{ad.subtitle}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{ad.description}</p>
              <a
                href={`tel:${ad.phone}`}
                className={`inline-flex items-center gap-1 text-xs font-semibold ${ad.textAccent} hover:underline`}
              >
                <ExternalLink className="w-3 h-3" /> {ad.phone}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
