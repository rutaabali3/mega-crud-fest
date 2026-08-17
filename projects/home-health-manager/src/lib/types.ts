export type Room = "Kitchen" | "Bathroom" | "Bedroom" | "Living Room" | "Garage" | "Exterior" | "Basement" | "Other";
export type TaskType = "Inspection" | "Cleaning" | "Repair" | "Replacement" | "Servicing";
export type RecurrenceLabel = "Monthly" | "Quarterly" | "Bi-Annually" | "Yearly" | "Custom";
export type TaskStatus = "pending" | "overdue" | "completed";
export type Specialty = "Plumbing" | "Electrical" | "HVAC" | "General" | "Roofing" | "Other";

export interface CostEntry {
  date: string;
  cost: number;
  note: string;
}

export interface Task {
  id: string;
  room: Room;
  appliance: string;
  taskType: TaskType;
  lastDoneDate: string;
  recurrenceInterval: number;
  recurrenceLabel: RecurrenceLabel;
  nextDueDate: string;
  isOneTime: boolean;
  status: TaskStatus;
  completedDate: string | null;
  contractorName: string;
  contractorPhone: string;
  contractorNote: string;
  cost: number | null;
  costHistory: CostEntry[];
}

export interface Contractor {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialty: Specialty;
  rating: number;
  notes: string;
}

export type ViewType = "dashboard" | "tasks" | "contractors" | "costHistory";

export const ROOMS: Room[] = ["Kitchen", "Bathroom", "Bedroom", "Living Room", "Garage", "Exterior", "Basement", "Other"];
export const TASK_TYPES: TaskType[] = ["Inspection", "Cleaning", "Repair", "Replacement", "Servicing"];
export const RECURRENCE_OPTIONS: { label: RecurrenceLabel; days: number }[] = [
  { label: "Monthly", days: 30 },
  { label: "Quarterly", days: 90 },
  { label: "Bi-Annually", days: 180 },
  { label: "Yearly", days: 365 },
  { label: "Custom", days: 0 },
];
export const SPECIALTIES: Specialty[] = ["Plumbing", "Electrical", "HVAC", "General", "Roofing", "Other"];

export const ROOM_ICONS: Record<Room, string> = {
  Kitchen: "ChefHat",
  Bathroom: "Bath",
  Bedroom: "Bed",
  "Living Room": "Sofa",
  Garage: "Car",
  Exterior: "Trees",
  Basement: "ArrowDown",
  Other: "Home",
};
