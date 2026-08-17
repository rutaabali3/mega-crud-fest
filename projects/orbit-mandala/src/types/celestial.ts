export interface CelestialBody {
  id: string;
  name: string;
  type: "planet" | "moon" | "comet" | "star";
  size: number;        // 0.5 – 3.0
  distance: number;    // orbital radius 5 – 25
  speed: number;       // orbital speed multiplier 0.1 – 2.0
  color: string;       // hex
  note: string;
  createdAt: string;
  category: string;
}

export const DEFAULT_BODIES: CelestialBody[] = [
  {
    id: "default-1",
    name: "First Memory",
    type: "planet",
    size: 1.2,
    distance: 8,
    speed: 0.5,
    color: "#4A9EE0",
    note: "The beginning of everything. Your first step into the cosmos.",
    createdAt: new Date().toISOString(),
    category: "Memories",
  },
];
