import { z } from "zod";

export type MediaType = "book" | "movie" | "game";
export type MediaStatus = "want" | "in-progress" | "finished";

export interface MediaProgress {
  current: number;
  total: number;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  creator: string;
  rating: number;
  status: MediaStatus;
  review: string;
  progress: MediaProgress;
  imageUrl: string;
  dateAdded: string;
}

export const mediaProgressSchema = z.object({
  current: z.number(),
  total: z.number(),
});

export const mediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(["book", "movie", "game"]),
  title: z.string(),
  creator: z.string(),
  rating: z.number(),
  status: z.enum(["want", "in-progress", "finished"]),
  review: z.string(),
  progress: mediaProgressSchema,
  imageUrl: z.string(),
  dateAdded: z.string(),
});

export const mediaItemsSchema = z.array(mediaItemSchema);

export const CREATOR_LABELS: Record<MediaType, string> = {
  book: "Author",
  movie: "Director",
  game: "Studio / Developer",
};

export const PROGRESS_LABELS: Record<MediaType, { current: string; total: string; unit: string }> = {
  book: { current: "Pages read", total: "Total pages", unit: "pages" },
  movie: { current: "Episodes watched", total: "Total episodes", unit: "episodes" },
  game: { current: "Hours played", total: "Total hours", unit: "hours" },
};

export const STATUS_LABELS: Record<MediaStatus, string> = {
  want: "Want to Consume",
  "in-progress": "In Progress",
  finished: "Finished",
};
