export type DecisionCategory =
  | "Career"
  | "Finance"
  | "Relationships"
  | "Health"
  | "Education"
  | "Personal Growth"
  | "Business"
  | "Other";

export type DecisionStatus = "pending" | "decided" | "outcome_recorded";

export type BiasTag =
  | "Confirmation Bias"
  | "Sunk Cost"
  | "Overconfidence"
  | "FOMO"
  | "Analysis Paralysis"
  | "Herd Mentality"
  | "Anchoring"
  | "Recency Bias";

export const ALL_CATEGORIES: DecisionCategory[] = [
  "Career", "Finance", "Relationships", "Health",
  "Education", "Personal Growth", "Business", "Other",
];

export const ALL_STATUSES: DecisionStatus[] = ["pending", "decided", "outcome_recorded"];

export const ALL_BIAS_TAGS: BiasTag[] = [
  "Confirmation Bias", "Sunk Cost", "Overconfidence", "FOMO",
  "Analysis Paralysis", "Herd Mentality", "Anchoring", "Recency Bias",
];

export const BIAS_DEFINITIONS: Record<BiasTag, string> = {
  "Confirmation Bias": "Favoring info that confirms your existing beliefs.",
  "Sunk Cost": "Continuing because of past investment rather than future value.",
  "Overconfidence": "Being more certain than the evidence warrants.",
  "FOMO": "Fear of missing out driving hasty choices.",
  "Analysis Paralysis": "Over-analyzing to the point of inaction.",
  "Herd Mentality": "Following what everyone else is doing.",
  "Anchoring": "Relying too heavily on the first piece of info encountered.",
  "Recency Bias": "Overweighting recent events over historical data.",
};

export interface DecisionOption {
  id: string;
  text: string;
  pros: string[];
  cons: string[];
}

export interface Decision {
  id: string;
  title: string;
  category: DecisionCategory;
  dateCreated: string;
  deadline: string | null;
  status: DecisionStatus;
  options: DecisionOption[];
  chosenOption: string | null;
  reasoning: string;
  expectedOutcome: string;
  confidenceScore: number;
  actualOutcome: string | null;
  actualOutcomeDate: string | null;
  reflectionNotes: string | null;
  qualityScore: number | null;
  biasTags: BiasTag[];
  isTrashed: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  showConfidence: boolean;
  showBiasTags: boolean;
}

import { z } from "zod";

export const decisionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

export const decisionCategorySchema = z.enum([
  "Career", "Finance", "Relationships", "Health",
  "Education", "Personal Growth", "Business", "Other",
]);

export const decisionStatusSchema = z.enum(["pending", "decided", "outcome_recorded"]);

export const biasTagSchema = z.enum([
  "Confirmation Bias", "Sunk Cost", "Overconfidence", "FOMO",
  "Analysis Paralysis", "Herd Mentality", "Anchoring", "Recency Bias",
]);

export const decisionSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: decisionCategorySchema,
  dateCreated: z.string(),
  deadline: z.string().nullable(),
  status: decisionStatusSchema,
  options: z.array(decisionOptionSchema),
  chosenOption: z.string().nullable(),
  reasoning: z.string(),
  expectedOutcome: z.string(),
  confidenceScore: z.number(),
  actualOutcome: z.string().nullable(),
  actualOutcomeDate: z.string().nullable(),
  reflectionNotes: z.string().nullable(),
  qualityScore: z.number().nullable(),
  biasTags: z.array(biasTagSchema),
  isTrashed: z.boolean(),
});

export const importDecisionsSchema = z.array(decisionSchema);
