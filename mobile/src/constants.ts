import { ClothingType, Season } from './types';

// Change to your local IP when testing on a physical device, e.g. 'http://192.168.1.100:8000'
export const BASE_URL = 'http://localhost:8000';

export const THEME = {
  bg: '#0f0f1a',
  card: '#1a1a2e',
  cardBorder: '#2d2d4e',
  primary: '#7c3aed',
  primaryLight: '#a855f7',
  text: '#f1f5f9',
  subtext: '#94a3b8',
  muted: '#475569',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  inputBg: '#1e1e38',
};

export const CLOTHING_TYPES: { value: ClothingType; label: string; emoji: string }[] = [
  { value: 'tshirt',      label: 'Футболка',    emoji: '👕' },
  { value: 'shirt',       label: 'Рубашка',     emoji: '👔' },
  { value: 'hoodie',      label: 'Худи',        emoji: '🧥' },
  { value: 'sweater',     label: 'Свитер',      emoji: '🧶' },
  { value: 'jacket',      label: 'Куртка',      emoji: '🥼' },
  { value: 'coat',        label: 'Пальто',      emoji: '🧥' },
  { value: 'pants',       label: 'Брюки',       emoji: '👖' },
  { value: 'jeans',       label: 'Джинсы',      emoji: '👖' },
  { value: 'shorts',      label: 'Шорты',       emoji: '🩳' },
  { value: 'dress',       label: 'Платье',      emoji: '👗' },
  { value: 'skirt',       label: 'Юбка',        emoji: '👗' },
  { value: 'shoes',       label: 'Обувь',       emoji: '👟' },
  { value: 'socks',       label: 'Носки',       emoji: '🧦' },
  { value: 'underwear',   label: 'Нижнее',      emoji: '🩲' },
  { value: 'hat',         label: 'Шапка/Кепка', emoji: '🎩' },
  { value: 'scarf',       label: 'Шарф',        emoji: '🧣' },
  { value: 'gloves',      label: 'Перчатки',    emoji: '🧤' },
  { value: 'bag',         label: 'Сумка',       emoji: '👜' },
  { value: 'accessories', label: 'Аксессуары',  emoji: '💍' },
];

export const SEASONS: { value: Season; label: string; emoji: string }[] = [
  { value: 'spring',     label: 'Весна',       emoji: '🌸' },
  { value: 'summer',     label: 'Лето',        emoji: '☀️' },
  { value: 'autumn',     label: 'Осень',       emoji: '🍂' },
  { value: 'winter',     label: 'Зима',        emoji: '❄️' },
  { value: 'all_season', label: 'Всесезонное', emoji: '🌍' },
];
