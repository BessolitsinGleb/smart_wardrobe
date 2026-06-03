from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories.outfit_repository import OutfitRepository
from app.repositories.clothes_repository import ClothesRepository
from app.services.ai_service import AIService
from app.services.clothes_service import ClothesService
from app.models import Outfit, Season
from app.schemas import OutfitGenerateRequest, OutfitResponse, OutfitItemResponse, ClothesResponse


class OutfitService:
    def __init__(self, db: Session):
        self._outfit_repo = OutfitRepository(db)
        self._clothes_repo = ClothesRepository(db)
        self._ai = AIService()

    def generate(self, request: OutfitGenerateRequest) -> OutfitResponse:
        clothes = self._clothes_repo.get_by_user(
            user_id=request.user_id, season=request.season
        )
        if len(clothes) < 3:
            raise HTTPException(
                status_code=400,
                detail="Мало вещей в гардеробе. Добавь хотя бы 3 предмета.",
            )

        result = self._ai.generate_outfit(
            clothes=clothes, season=request.season, occasion=request.occasion
        )

        valid_ids = {c.id for c in clothes}
        selected_ids = [i for i in result.get("selected_ids", []) if i in valid_ids]
        if not selected_ids:
            raise HTTPException(status_code=500, detail="ИИ не смог выбрать подходящие вещи")

        outfit = self._outfit_repo.create(
            user_id=request.user_id,
            clothes_ids=selected_ids,
            ai_comment=result.get("comment", "Отличный образ!"),
            name=result.get("outfit_name"),
            season=request.season,
        )
        return self._to_response(outfit)

    def get_user_outfits(self, user_id: int) -> List[OutfitResponse]:
        return [self._to_response(o) for o in self._outfit_repo.get_by_user(user_id)]

    def delete_outfit(self, outfit_id: int, user_id: int) -> None:
        outfit = self._outfit_repo.get_by_id(outfit_id)
        if not outfit or outfit.user_id != user_id:
            raise HTTPException(status_code=404, detail="Аутфит не найден")
        self._outfit_repo.delete(outfit_id)

    # ── internal ─────────────────────────────────────────────────────────────

    @staticmethod
    def _to_response(outfit: Outfit) -> OutfitResponse:
        items = []
        for item in outfit.items:
            c = item.clothes
            items.append(
                OutfitItemResponse(
                    clothes=ClothesResponse(
                        id=c.id,
                        user_id=c.user_id,
                        name=c.name,
                        clothing_type=c.clothing_type,
                        season=c.season,
                        color=c.color,
                        brand=c.brand,
                        comment=c.comment,
                        rating=c.rating,
                        image_path=c.image_path,
                        image_url=f"/{c.image_path}",
                        created_at=c.created_at,
                    )
                )
            )
        return OutfitResponse(
            id=outfit.id,
            user_id=outfit.user_id,
            name=outfit.name,
            ai_comment=outfit.ai_comment,
            season=outfit.season,
            items=items,
            created_at=outfit.created_at,
        )
