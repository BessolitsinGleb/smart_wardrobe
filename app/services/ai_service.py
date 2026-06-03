import json
import os
import random
from typing import List, Optional
from openai import OpenAI
from app.models import Clothes, ClothingType, Season

_TOPS = {ClothingType.TSHIRT, ClothingType.SHIRT, ClothingType.HOODIE,
         ClothingType.SWEATER, ClothingType.JACKET, ClothingType.COAT}
_BOTTOMS = {ClothingType.PANTS, ClothingType.JEANS, ClothingType.SHORTS,
            ClothingType.DRESS, ClothingType.SKIRT}


class AIService:
    def __init__(self):
        api_key = os.getenv("OPENROUTER_API_KEY")
        self._client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        ) if api_key else None

    def generate_outfit(
        self,
        clothes: List[Clothes],
        season: Optional[Season] = None,
        occasion: Optional[str] = None,
    ) -> dict:
        if not self._client:
            return self._fallback(clothes)

        wardrobe = self._format_wardrobe(clothes)
        season_hint = season.value if season else "не указан"
        occasion_hint = occasion or "повседневный / casual"

        prompt = f"""Вот гардероб пользователя:

{wardrobe}

Сезон: {season_hint}
Повод: {occasion_hint}

Составь стильный законченный образ. Правила:
- Предпочитай вещи с высоким рейтингом (ближе к 10)
- Образ должен соответствовать сезону
- Обязательно включи: верх (tshirt/shirt/hoodie/sweater/jacket/coat), низ (pants/jeans/shorts/skirt/dress) или dress, обувь (shoes)
- Цвета и стили должны сочетаться

Ответь валидным JSON:
{{
  "selected_ids": [1, 5, 8],
  "outfit_name": "Casual Street Look",
  "comment": "Почему этот образ крутой (2-3 предложения, с энтузиазмом!)"
}}

Выбирай ID из списка гардероба выше."""

        try:
            response = self._client.chat.completions.create(
                model="gpt-4o-mini",
                max_tokens=600,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": "Ты профессиональный модный стилист. Отвечаешь строго JSON без лишнего текста."},
                    {"role": "user", "content": prompt},
                ],
            )
            return json.loads(response.choices[0].message.content)
        except Exception:
            return self._fallback(clothes)

    # ── helpers ──────────────────────────────────────────────────────────────

    def _format_wardrobe(self, clothes: List[Clothes]) -> str:
        lines = []
        for c in clothes:
            parts = [f"ID:{c.id}", c.name, f"тип:{c.clothing_type.value}",
                     f"сезон:{c.season.value}", f"рейтинг:{c.rating}"]
            if c.color:
                parts.append(f"цвет:{c.color}")
            if c.brand:
                parts.append(f"бренд:{c.brand}")
            if c.comment:
                parts.append(f"заметка:{c.comment}")
            lines.append(" | ".join(parts))
        return "\n".join(lines)

    def _fallback(self, clothes: List[Clothes]) -> dict:
        """Случайный аутфит если API недоступен."""
        tops = [c for c in clothes if c.clothing_type in _TOPS]
        bottoms = [c for c in clothes if c.clothing_type in _BOTTOMS]
        shoes = [c for c in clothes if c.clothing_type == ClothingType.SHOES]
        socks = [c for c in clothes if c.clothing_type == ClothingType.SOCKS]

        selected: List[Clothes] = []
        if tops:
            # Взвешенный выбор по рейтингу
            selected.append(random.choices(tops, weights=[c.rating for c in tops])[0])
        if bottoms:
            selected.append(random.choices(bottoms, weights=[c.rating for c in bottoms])[0])
        if shoes:
            selected.append(random.choices(shoes, weights=[c.rating for c in shoes])[0])
        if socks:
            selected.append(random.choices(socks, weights=[c.rating for c in socks])[0])

        if not selected:
            selected = random.sample(clothes, min(3, len(clothes)))

        return {
            "selected_ids": [c.id for c in selected],
            "outfit_name": "Random Pick",
            "comment": (
                "Случайная подборка из твоего гардероба. "
                "Добавь OPENROUTER_API_KEY в .env чтобы получать умные рекомендации от ИИ!"
            ),
        }
