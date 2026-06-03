export type ClothingType =
  | 'tshirt' | 'shirt' | 'hoodie' | 'sweater' | 'jacket' | 'coat'
  | 'pants' | 'jeans' | 'shorts' | 'dress' | 'skirt' | 'shoes'
  | 'socks' | 'underwear' | 'hat' | 'scarf' | 'gloves' | 'bag' | 'accessories';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all_season';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Clothes {
  id: number;
  user_id: number;
  name: string;
  clothing_type: ClothingType;
  season: Season;
  color: string | null;
  brand: string | null;
  comment: string | null;
  rating: number;
  image_path: string;
}

export interface OutfitItem {
  clothes_id: number;
  clothes?: Clothes;
}

export interface Outfit {
  id: number;
  user_id: number;
  name: string;
  ai_comment: string;
  season: string;
  created_at: string;
  items: OutfitItem[];
}
