# 👗 Smart Wardrobe

Приложение для управления цифровым гардеробом с ИИ-стилистом. Загружай фото одежды, оценивай вещи и получай готовые аутфиты — GPT-4o-mini учитывает рейтинги, сезон и повод.

## Запуск бэкенда

```bash
cd smart_wardrobe

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Открой .env и вставь OPENROUTER_API_KEY

uvicorn app.main:app --reload --host 0.0.0.0
```

Бэкенд доступен на `http://localhost:8000`. Веб-версия — там же в браузере.

## Запуск мобильного приложения (Expo)

> Нужен [Node.js](https://nodejs.org) и приложение **Expo Go** на телефоне.

```bash
cd smart_wardrobe/mobile

npm install
```

Если тестируешь на **физическом устройстве** — открой [src/constants.ts](mobile/src/constants.ts) и замени `BASE_URL`:

```ts
// вместо localhost — IP-адрес твоего Mac в локальной сети
export const BASE_URL = 'http://192.168.1.100:8000';
```

Затем запускай:

```bash
npx expo start
```

Отсканируй QR-код в **Expo Go** (iOS / Android). Для симулятора нажми `i` (iOS) или `a` (Android).

## Переменные окружения

```env
OPENROUTER_API_KEY=sk-or-v1-...   # OpenRouter ключ (опционально)
DATABASE_URL=sqlite:///./wardrobe.db
```

Без ключа приложение работает в режиме взвешенного случайного выбора.
