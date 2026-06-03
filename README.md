# 👗 Smart Wardrobe

Веб-приложение для управления цифровым гардеробом с ИИ-стилистом. Загружай фото одежды, оценивай вещи и получай готовые аутфиты — GPT-4o-mini учитывает твои рейтинги, сезон и повод.

## Стек

| Слой | Технологии |
| ---- | ---------- |
| Backend | Python 3.10+, FastAPI, SQLAlchemy, SQLite / PostgreSQL |
| AI | OpenRouter (gpt-4o-mini по умолчанию, любая модель) |
| Image | Pillow (любой формат → JPG) |
| Frontend | Vue 3 (CDN), vanilla CSS |

## Архитектура

```text
Layered Architecture
─────────────────────────────────────────────────────────────
Presentation   app/routers/         HTTP-эндпоинты FastAPI
Business Logic app/services/        Логика + вызов OpenAI
Data Access    app/repositories/    CRUD-запросы SQLAlchemy
Database       SQLite / PostgreSQL  Хранение данных и фото
─────────────────────────────────────────────────────────────
Frontend       frontend/            Vue 3 SPA (одна страница)
```

## Быстрый старт

```bash
# 1. Клонируй / распакуй проект
cd smart_wardrobe

# 2. Создай виртуальное окружение
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Установи зависимости
pip install -r requirements.txt

# 4. Настрой окружение
cp .env.example .env
# Открой .env и вставь свой OPENAI_API_KEY

# 5. Запусти сервер
uvicorn app.main:app --reload
```

Открой <http://localhost:8000> — приложение готово к работе.

> Без `OPENAI_API_KEY` приложение работает в режиме случайного взвешенного выбора: вещи с высоким рейтингом предлагаются чаще.

## Структура проекта

```text
smart_wardrobe/
├── app/
│   ├── main.py                  # Точка входа FastAPI
│   ├── database.py              # Подключение к БД
│   ├── models.py                # SQLAlchemy: User, Clothes, Outfit, OutfitItem
│   ├── schemas.py               # Pydantic-схемы запросов и ответов
│   ├── repositories/
│   │   ├── user_repository.py
│   │   ├── clothes_repository.py
│   │   └── outfit_repository.py
│   ├── services/
│   │   ├── user_service.py
│   │   ├── clothes_service.py   # Конвертация фото в JPG
│   │   ├── outfit_service.py
│   │   └── ai_service.py        # OpenRouter (gpt-4o-mini по умолчанию, любая модель)
│   └── routers/
│       ├── users.py
│       ├── clothes.py
│       └── outfits.py
├── frontend/
│   ├── index.html               # Vue 3 SPA
│   ├── style.css
│   └── app.js
├── static/uploads/              # Загруженные фото (создаётся автоматически)
├── .env.example
└── requirements.txt
```

## Модели данных

### User

| Поле | Тип | Описание |
| ---- | --- | -------- |
| id | int | PK |
| username | str | Уникальный ник |
| email | str | Уникальный email |
| hashed_password | str | pbkdf2-sha256 |
| created\_at | datetime | Дата регистрации |

### Clothes

| Поле | Тип | Описание |
| ---- | --- | -------- |
| id | int | PK |
| user\_id | int | FK → User |
| name | str | Название («Белые Nike AF1») |
| clothing\_type | enum | tshirt / shirt / hoodie / sweater / jacket / coat / pants / jeans / shorts / dress / skirt / shoes / socks / underwear / hat / scarf / gloves / bag / accessories |
| season | enum | spring / summer / autumn / winter / all\_season |
| color | str | Цвет (опц.) |
| brand | str | Бренд (опц.) |
| comment | str | Личная заметка (опц.) |
| rating | float 1–10 | Чем выше — тем чаще предлагается в аутфитах |
| image\_path | str | Путь к JPG-файлу |

### Outfit

| Поле | Тип | Описание |
| ---- | --- | -------- |
| id | int | PK |
| user\_id | int | FK → User |
| name | str | Название аутфита от ИИ |
| ai\_comment | str | Объяснение почему образ крутой |
| season | enum | Сезон подборки |
| items | OutfitItem[] | Список вещей (по `clothes_id`) |

## API

| Метод | Путь | Описание |
| ----- | ---- | -------- |
| `POST` | `/api/users/` | Создать аккаунт |
| `GET` | `/api/users/{id}` | Получить пользователя |
| `POST` | `/api/clothes/upload` | Загрузить фото вещи (multipart, конвертация в JPG) |
| `GET` | `/api/clothes/user/{id}` | Все вещи пользователя (фильтр по сезону) |
| `PATCH` | `/api/clothes/{id}` | Обновить данные вещи |
| `DELETE` | `/api/clothes/{id}` | Удалить вещь |
| `POST` | `/api/outfits/generate` | Собрать аутфит через ИИ |
| `GET` | `/api/outfits/user/{id}` | История аутфитов |
| `DELETE` | `/api/outfits/{id}` | Удалить аутфит |

Интерактивная документация: <http://localhost:8000/docs>

## Как работает ИИ-подборка

1. Из гардероба берутся вещи, подходящие под выбранный сезон (`season` или `all_season`)
2. Список с рейтингами, цветами и заметками отправляется в GPT-4o-mini
3. Модель выбирает IDs вещей (верх + низ + обувь), формирует название и объясняет почему образ крутой
4. Аутфит сохраняется в историю; фотографии отображаются прямо в браузере

Без API-ключа — взвешенный случайный выбор: `random.choices(..., weights=[c.rating ...])`.

## Переменные окружения

```env
OPENROUTER_API_KEY=sk-or-v1-...             # OpenRouter ключ (опционально)
DATABASE_URL=sqlite:///./wardrobe.db         # или postgresql://...
```

## PostgreSQL (опционально)

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/wardrobe

# Дополнительная зависимость
pip install psycopg2-binary
```
