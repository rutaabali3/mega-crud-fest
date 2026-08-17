import { Trip, DayPlan, PackingCategory, PackingItem } from "@/types/trip";

export function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getDestinationEmoji(dest: string): string {
  const d = dest.toLowerCase();
  if (d.includes("beach") || d.includes("bali") || d.includes("hawaii") || d.includes("maldives")) return "🏖️";
  if (d.includes("paris") || d.includes("france")) return "🗼";
  if (d.includes("japan") || d.includes("tokyo") || d.includes("kyoto")) return "🗾";
  if (d.includes("london") || d.includes("uk") || d.includes("england")) return "🇬🇧";
  if (d.includes("new york") || d.includes("nyc")) return "🗽";
  if (d.includes("rome") || d.includes("italy")) return "🏛️";
  if (d.includes("mountain") || d.includes("alps") || d.includes("nepal")) return "🏔️";
  if (d.includes("australia") || d.includes("sydney")) return "🦘";
  if (d.includes("india")) return "🇮🇳";
  if (d.includes("china") || d.includes("beijing")) return "🇨🇳";
  if (d.includes("egypt") || d.includes("cairo")) return "🏺";
  if (d.includes("safari") || d.includes("kenya") || d.includes("africa")) return "🦁";
  if (d.includes("cruise") || d.includes("caribbean")) return "🚢";
  if (d.includes("camping")) return "⛺";
  return "✈️";
}

export function getTripStatus(trip: Trip): "UPCOMING" | "ONGOING" | "COMPLETED" {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now < start) return "UPCOMING";
  if (now > end) return "COMPLETED";
  return "ONGOING";
}

export function getDaysUntil(trip: Trip): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const status = getTripStatus(trip);
  if (status === "UPCOMING") {
    const days = Math.ceil((start.getTime() - now.getTime()) / 86400000);
    return `${days} day${days !== 1 ? "s" : ""} until departure`;
  }
  if (status === "ONGOING") {
    const dayNum = Math.ceil((now.getTime() - start.getTime()) / 86400000) + 1;
    const total = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
    return `Day ${dayNum} of ${total}`;
  }
  return "Trip completed";
}

export function getTripDuration(trip: Trip): number {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  return Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
}

export function getPackingProgress(trip: Trip): { packed: number; total: number } {
  let packed = 0, total = 0;
  trip.packingCategories.forEach((c) => {
    c.items.forEach((i) => { total++; if (i.packed) packed++; });
  });
  return { packed, total };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDayHeader(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function generateItinerary(startDate: string, endDate: string): DayPlan[] {
  const days: DayPlan[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push({ date: d.toISOString().split("T")[0], activities: [] });
  }
  return days;
}

export function getActivityIcon(type: string): string {
  switch (type) {
    case "food": return "🍽️";
    case "transport": return "🚗";
    case "activity": return "🎭";
    case "hotel": return "🏨";
    default: return "📌";
  }
}

const TEMPLATE_DATA: Record<string, PackingCategory[]> = {
  default: [
    { id: "", name: "Clothing", color: "#3b82f6", items: [
      { id: "", name: "T-shirts", quantity: 4, packed: false, essential: true },
      { id: "", name: "Pants/Shorts", quantity: 3, packed: false, essential: true },
      { id: "", name: "Underwear", quantity: 5, packed: false, essential: true },
      { id: "", name: "Socks", quantity: 4, packed: false, essential: true },
      { id: "", name: "Jacket", quantity: 1, packed: false, essential: false },
    ]},
    { id: "", name: "Electronics", color: "#8b5cf6", items: [
      { id: "", name: "Phone charger", quantity: 1, packed: false, essential: true },
      { id: "", name: "Power bank", quantity: 1, packed: false, essential: false },
      { id: "", name: "Headphones", quantity: 1, packed: false, essential: false },
    ]},
    { id: "", name: "Documents", color: "#ef4444", items: [
      { id: "", name: "Passport", quantity: 1, packed: false, essential: true },
      { id: "", name: "Boarding pass", quantity: 1, packed: false, essential: true },
      { id: "", name: "Travel insurance", quantity: 1, packed: false, essential: true },
    ]},
    { id: "", name: "Toiletries", color: "#10b981", items: [
      { id: "", name: "Toothbrush & paste", quantity: 1, packed: false, essential: true },
      { id: "", name: "Deodorant", quantity: 1, packed: false, essential: true },
      { id: "", name: "Sunscreen", quantity: 1, packed: false, essential: false },
    ]},
    { id: "", name: "Medications", color: "#f59e0b", items: [
      { id: "", name: "Personal medication", quantity: 1, packed: false, essential: true },
      { id: "", name: "First aid kit", quantity: 1, packed: false, essential: false },
    ]},
    { id: "", name: "Snacks", color: "#ec4899", items: [
      { id: "", name: "Granola bars", quantity: 3, packed: false, essential: false },
      { id: "", name: "Water bottle", quantity: 1, packed: false, essential: true },
    ]},
  ],
  beach: [
    { id: "", name: "Beachwear", color: "#06b6d4", items: [
      { id: "", name: "Swimsuit", quantity: 2, packed: false, essential: true },
      { id: "", name: "Flip flops", quantity: 1, packed: false, essential: true },
      { id: "", name: "Beach towel", quantity: 1, packed: false, essential: true },
      { id: "", name: "Sunglasses", quantity: 1, packed: false, essential: true },
      { id: "", name: "Sun hat", quantity: 1, packed: false, essential: false },
    ]},
    { id: "", name: "Sun Protection", color: "#f59e0b", items: [
      { id: "", name: "Sunscreen SPF 50", quantity: 1, packed: false, essential: true },
      { id: "", name: "After-sun lotion", quantity: 1, packed: false, essential: false },
    ]},
  ],
  business: [
    { id: "", name: "Business Attire", color: "#1e293b", items: [
      { id: "", name: "Suits", quantity: 2, packed: false, essential: true },
      { id: "", name: "Dress shirts", quantity: 3, packed: false, essential: true },
      { id: "", name: "Dress shoes", quantity: 1, packed: false, essential: true },
      { id: "", name: "Ties", quantity: 2, packed: false, essential: false },
    ]},
    { id: "", name: "Tech", color: "#8b5cf6", items: [
      { id: "", name: "Laptop", quantity: 1, packed: false, essential: true },
      { id: "", name: "Laptop charger", quantity: 1, packed: false, essential: true },
      { id: "", name: "Business cards", quantity: 1, packed: false, essential: true },
    ]},
  ],
  mountain: [
    { id: "", name: "Hiking Gear", color: "#059669", items: [
      { id: "", name: "Hiking boots", quantity: 1, packed: false, essential: true },
      { id: "", name: "Trekking poles", quantity: 1, packed: false, essential: false },
      { id: "", name: "Backpack", quantity: 1, packed: false, essential: true },
      { id: "", name: "Rain jacket", quantity: 1, packed: false, essential: true },
    ]},
    { id: "", name: "Warmth", color: "#dc2626", items: [
      { id: "", name: "Thermal layers", quantity: 2, packed: false, essential: true },
      { id: "", name: "Warm hat", quantity: 1, packed: false, essential: true },
      { id: "", name: "Gloves", quantity: 1, packed: false, essential: true },
    ]},
  ],
  city: [
    { id: "", name: "City Essentials", color: "#6366f1", items: [
      { id: "", name: "Comfortable walking shoes", quantity: 1, packed: false, essential: true },
      { id: "", name: "Day bag/backpack", quantity: 1, packed: false, essential: true },
      { id: "", name: "Umbrella", quantity: 1, packed: false, essential: false },
      { id: "", name: "City map/guidebook", quantity: 1, packed: false, essential: false },
    ]},
  ],
  camping: [
    { id: "", name: "Camping Gear", color: "#16a34a", items: [
      { id: "", name: "Tent", quantity: 1, packed: false, essential: true },
      { id: "", name: "Sleeping bag", quantity: 1, packed: false, essential: true },
      { id: "", name: "Sleeping pad", quantity: 1, packed: false, essential: true },
      { id: "", name: "Flashlight/headlamp", quantity: 1, packed: false, essential: true },
      { id: "", name: "Multi-tool", quantity: 1, packed: false, essential: false },
    ]},
  ],
  roadtrip: [
    { id: "", name: "Road Trip Essentials", color: "#ea580c", items: [
      { id: "", name: "Snacks & drinks", quantity: 1, packed: false, essential: true },
      { id: "", name: "Car charger", quantity: 1, packed: false, essential: true },
      { id: "", name: "Playlist/podcasts downloaded", quantity: 1, packed: false, essential: false },
      { id: "", name: "Cooler", quantity: 1, packed: false, essential: false },
    ]},
  ],
};

export function getPackingTemplate(templateKey: string): PackingCategory[] {
  const cats = TEMPLATE_DATA[templateKey] || TEMPLATE_DATA.default;
  return cats.map((c) => ({
    ...c,
    id: generateId(),
    items: c.items.map((i) => ({ ...i, id: generateId() })),
  }));
}

export const PRESET_CATEGORY_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
