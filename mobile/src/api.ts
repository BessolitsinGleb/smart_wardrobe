import { BASE_URL } from './constants';
import { User, Clothes, Outfit, Season, ClothingType } from './types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ошибка сервера' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<User>(res);
}

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/users/${id}`);
  return handleResponse<User>(res);
}

export async function fetchClothes(userId: number): Promise<Clothes[]> {
  const res = await fetch(`${BASE_URL}/api/clothes/user/${userId}`);
  return handleResponse<Clothes[]>(res);
}

export interface UploadClothesData {
  name: string;
  clothing_type: ClothingType;
  season: Season;
  color?: string;
  brand?: string;
  comment?: string;
  rating: number;
  imageUri: string;
}

export async function uploadClothes(
  userId: number,
  data: UploadClothesData,
): Promise<Clothes> {
  const formData = new FormData();
  formData.append('user_id', String(userId));
  formData.append('name', data.name);
  formData.append('clothing_type', data.clothing_type);
  formData.append('season', data.season);
  if (data.color) formData.append('color', data.color);
  if (data.brand) formData.append('brand', data.brand);
  if (data.comment) formData.append('comment', data.comment);
  formData.append('rating', String(data.rating));
  formData.append('file', {
    uri: data.imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);

  const res = await fetch(`${BASE_URL}/api/clothes/upload`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<Clothes>(res);
}

export async function deleteClothes(id: number, userId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/clothes/${id}?user_id=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`HTTP ${res.status}`);
  }
}

export async function generateOutfit(data: {
  user_id: number;
  season?: string | null;
  occasion?: string | null;
}): Promise<Outfit> {
  const res = await fetch(`${BASE_URL}/api/outfits/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Outfit>(res);
}

export async function fetchOutfits(userId: number): Promise<Outfit[]> {
  const res = await fetch(`${BASE_URL}/api/outfits/user/${userId}`);
  return handleResponse<Outfit[]>(res);
}

export async function deleteOutfit(id: number, userId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/outfits/${id}?user_id=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`HTTP ${res.status}`);
  }
}
