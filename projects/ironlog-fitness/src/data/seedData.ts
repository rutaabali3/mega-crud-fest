import { Program } from "@/types";

export const COMMON_EXERCISES = [
  "Bench Press", "Squat", "Deadlift", "Overhead Press", "Pull-up", "Barbell Row",
  "Bicep Curl", "Tricep Pushdown", "Leg Press", "Lunge", "Plank", "Hip Thrust",
  "Lat Pulldown", "Face Pull", "Dips", "Incline Bench", "Romanian Deadlift",
  "Leg Curl", "Leg Extension", "Cable Fly", "Shrugs", "Calf Raise", "Arnold Press",
  "Hammer Curl", "Skull Crushers", "Good Morning", "Box Jump", "Battle Rope",
  "Sled Push", "Farmer Walk",
];

const makeExercise = (name: string, sets: number, reps: string, rest: number) => ({
  id: crypto.randomUUID(),
  name,
  sets,
  reps,
  restSeconds: rest,
  notes: "",
});

export const seedPrograms: Program[] = [
  {
    id: crypto.randomUUID(),
    name: "Push / Pull / Legs",
    daysPerWeek: 6,
    createdAt: new Date().toISOString(),
    days: [
      {
        dayIndex: 0,
        label: "Day 1 – Push",
        exercises: [
          makeExercise("Bench Press", 4, "6-8", 120),
          makeExercise("Overhead Press", 3, "8-10", 90),
          makeExercise("Incline Bench", 3, "8-12", 90),
          makeExercise("Cable Fly", 3, "12-15", 60),
          makeExercise("Tricep Pushdown", 3, "10-12", 60),
        ],
      },
      {
        dayIndex: 1,
        label: "Day 2 – Pull",
        exercises: [
          makeExercise("Deadlift", 4, "5", 180),
          makeExercise("Barbell Row", 4, "6-8", 120),
          makeExercise("Lat Pulldown", 3, "8-12", 90),
          makeExercise("Face Pull", 3, "12-15", 60),
          makeExercise("Bicep Curl", 3, "10-12", 60),
        ],
      },
      {
        dayIndex: 2,
        label: "Day 3 – Legs",
        exercises: [
          makeExercise("Squat", 4, "6-8", 180),
          makeExercise("Romanian Deadlift", 3, "8-10", 120),
          makeExercise("Leg Press", 3, "10-12", 90),
          makeExercise("Leg Curl", 3, "10-12", 60),
          makeExercise("Calf Raise", 4, "12-15", 60),
        ],
      },
      {
        dayIndex: 3,
        label: "Day 4 – Push",
        exercises: [
          makeExercise("Overhead Press", 4, "6-8", 120),
          makeExercise("Bench Press", 3, "8-10", 90),
          makeExercise("Dips", 3, "8-12", 90),
          makeExercise("Cable Fly", 3, "12-15", 60),
          makeExercise("Skull Crushers", 3, "10-12", 60),
        ],
      },
      {
        dayIndex: 4,
        label: "Day 5 – Pull",
        exercises: [
          makeExercise("Pull-up", 4, "AMRAP", 120),
          makeExercise("Barbell Row", 3, "8-10", 90),
          makeExercise("Lat Pulldown", 3, "10-12", 90),
          makeExercise("Face Pull", 3, "12-15", 60),
          makeExercise("Hammer Curl", 3, "10-12", 60),
        ],
      },
      {
        dayIndex: 5,
        label: "Day 6 – Legs",
        exercises: [
          makeExercise("Squat", 4, "8-10", 180),
          makeExercise("Hip Thrust", 3, "8-12", 90),
          makeExercise("Leg Extension", 3, "12-15", 60),
          makeExercise("Leg Curl", 3, "12-15", 60),
          makeExercise("Calf Raise", 4, "15-20", 60),
        ],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: "Full Body Strength",
    daysPerWeek: 3,
    createdAt: new Date().toISOString(),
    days: [
      {
        dayIndex: 0,
        label: "Day 1 – Full Body A",
        exercises: [
          makeExercise("Squat", 4, "5", 180),
          makeExercise("Bench Press", 4, "5", 180),
          makeExercise("Barbell Row", 4, "6-8", 120),
          makeExercise("Overhead Press", 3, "8-10", 90),
          makeExercise("Bicep Curl", 3, "10-12", 60),
          makeExercise("Plank", 3, "60s", 60),
        ],
      },
      {
        dayIndex: 1,
        label: "Day 2 – Full Body B",
        exercises: [
          makeExercise("Deadlift", 4, "5", 180),
          makeExercise("Incline Bench", 4, "6-8", 120),
          makeExercise("Pull-up", 4, "AMRAP", 120),
          makeExercise("Lunge", 3, "10", 90),
          makeExercise("Face Pull", 3, "12-15", 60),
          makeExercise("Tricep Pushdown", 3, "10-12", 60),
        ],
      },
      {
        dayIndex: 2,
        label: "Day 3 – Full Body C",
        exercises: [
          makeExercise("Squat", 3, "8-10", 120),
          makeExercise("Overhead Press", 4, "5", 180),
          makeExercise("Romanian Deadlift", 3, "8-10", 120),
          makeExercise("Lat Pulldown", 3, "10-12", 90),
          makeExercise("Dips", 3, "8-12", 90),
          makeExercise("Calf Raise", 4, "12-15", 60),
        ],
      },
    ],
  },
];
