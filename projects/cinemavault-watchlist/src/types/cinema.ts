export type ItemType = "Movie" | "Series";
export type ItemStatus = "To Watch" | "Watching" | "Watched";

export interface CinemaItem {
  id: string;
  title: string;
  type: ItemType;
  posterUrl: string;
  status: ItemStatus;
  personalRating: number;
  review: string;
  addedDate: string;
}
