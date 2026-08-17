export type ProjectType =
  | "knitting" | "woodwork" | "sewing" | "crochet"
  | "painting" | "embroidery" | "ceramics" | "other";

export type ProjectStatus = "wip" | "completed" | "archived";

export interface Material {
  id: string;
  name: string;
  quantity: string;
  costPaid: number;
  unit: string;
}

export interface Session {
  id: string;
  date: string;
  hoursLogged: number;
  note: string;
}

export interface CraftProject {
  id: string;
  title: string;
  type: ProjectType;
  status: ProjectStatus;
  photoURL: string;
  patternURL: string;
  progress: number;
  totalHoursSpent: number;
  startDate: string;
  targetEndDate: string;
  materials: Material[];
  sessions: Session[];
  estimatedSellingPrice: number;
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_TYPES: { value: ProjectType; label: string; emoji: string }[] = [
  { value: "knitting", label: "Knitting", emoji: "🧶" },
  { value: "woodwork", label: "Woodwork", emoji: "🪵" },
  { value: "sewing", label: "Sewing", emoji: "🧵" },
  { value: "crochet", label: "Crochet", emoji: "🪢" },
  { value: "painting", label: "Painting", emoji: "🎨" },
  { value: "embroidery", label: "Embroidery", emoji: "🪡" },
  { value: "ceramics", label: "Ceramics", emoji: "🏺" },
  { value: "other", label: "Other", emoji: "✂️" },
];

export const UNIT_OPTIONS = ["meters", "yards", "grams", "pieces", "oz", "skeins", "sheets"];

export const TYPE_COLORS: Record<ProjectType, string> = {
  knitting: "bg-craft-rose/20 text-craft-rose",
  woodwork: "bg-craft-walnut/20 text-craft-walnut",
  sewing: "bg-primary/20 text-primary",
  crochet: "bg-craft-sage/20 text-craft-sage",
  painting: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  embroidery: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  ceramics: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  other: "bg-muted text-muted-foreground",
};
