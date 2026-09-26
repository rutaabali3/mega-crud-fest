import { MediaItem, mediaItemsSchema } from "./types";

const KEY = "mediavault";

export function loadItems(): MediaItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = mediaItemsSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function saveItems(items: MediaItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function exportItems(items: MediaItem[]) {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mediavault-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importItems(file: File): Promise<MediaItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const result = mediaItemsSchema.safeParse(data);
        if (result.success) {
          resolve(result.data);
        } else {
          reject(new Error("Invalid format"));
        }
      } catch {
        reject(new Error("Invalid JSON"));
      }
    };
    reader.onerror = () => reject(new Error("Read error"));
    reader.readAsText(file);
  });
}
