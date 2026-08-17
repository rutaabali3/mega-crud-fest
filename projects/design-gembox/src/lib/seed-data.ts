import { Asset } from "@/types/asset";

const uuid = () => crypto.randomUUID();
const now = new Date().toISOString();

export const seedAssets: Asset[] = [
  {
    id: uuid(), name: "Brand Primary", type: "color",
    hexValues: ["#7C3AED", "#5B21B6", "#A78BFA"],
    fontFamily: "", fontWeights: [], iconSvg: "", imageUrl: "",
    tags: ["brand", "primary"], project: "Demo Brand Kit",
    createdAt: now, updatedAt: now,
  },
  {
    id: uuid(), name: "Brand Secondary", type: "color",
    hexValues: ["#F59E0B", "#D97706"],
    fontFamily: "", fontWeights: [], iconSvg: "", imageUrl: "",
    tags: ["brand", "secondary"], project: "Demo Brand Kit",
    createdAt: now, updatedAt: now,
  },
  {
    id: uuid(), name: "Inter", type: "font",
    hexValues: [],
    fontFamily: "Inter", fontWeights: ["400", "500", "700"],
    iconSvg: "", imageUrl: "",
    tags: ["sans-serif", "body"], project: "Demo Brand Kit",
    createdAt: now, updatedAt: now,
  },
  {
    id: uuid(), name: "Star Icon", type: "icon",
    hexValues: [], fontFamily: "", fontWeights: [],
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    imageUrl: "",
    tags: ["star", "rating"], project: "Demo Brand Kit",
    createdAt: now, updatedAt: now,
  },
  {
    id: uuid(), name: "Hero Image", type: "image",
    hexValues: [], fontFamily: "", fontWeights: [], iconSvg: "",
    imageUrl: "https://picsum.photos/400/300",
    tags: ["hero", "banner"], project: "Portfolio Site",
    createdAt: now, updatedAt: now,
  },
  {
    id: uuid(), name: "Coral Sunset", type: "color",
    hexValues: ["#FF6B6B", "#FF8E72", "#FFA07A", "#FFB347", "#FFD700"],
    fontFamily: "", fontWeights: [], iconSvg: "", imageUrl: "",
    tags: ["warm", "sunset", "gradient"], project: "Portfolio Site",
    createdAt: now, updatedAt: now,
  },
];
