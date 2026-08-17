export type AssetType = "color" | "font" | "icon" | "image";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  hexValues: string[];
  fontFamily: string;
  fontWeights: string[];
  iconSvg: string;
  imageUrl: string;
  tags: string[];
  project: string;
  createdAt: string;
  updatedAt: string;
}
