import { z } from "zod";

export const itemTypeSchema = z.enum(["Movie", "Series"]);
export type ItemType = z.infer<typeof itemTypeSchema>;

export const itemStatusSchema = z.enum(["To Watch", "Watching", "Watched"]);
export type ItemStatus = z.infer<typeof itemStatusSchema>;

export const cinemaItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: itemTypeSchema,
  posterUrl: z.string().optional().default(""),
  status: itemStatusSchema,
  personalRating: z.number().min(0).max(5).default(0),
  review: z.string().optional().default(""),
  addedDate: z.string(),
});

export type CinemaItem = z.infer<typeof cinemaItemSchema>;
