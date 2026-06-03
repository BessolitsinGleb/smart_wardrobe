import uuid
import os
from io import BytesIO
from pathlib import Path
from typing import List, Optional

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from PIL import Image

from app.repositories.clothes_repository import ClothesRepository
from app.models import Clothes, Season
from app.schemas import ClothesCreate, ClothesUpdate, ClothesResponse

UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class ClothesService:
    def __init__(self, db: Session):
        self._repo = ClothesRepository(db)

    async def upload_clothes(
        self, user_id: int, file: UploadFile, data: ClothesCreate
    ) -> ClothesResponse:
        image_path = await self._save_as_jpg(file)
        clothes = self._repo.create(user_id=user_id, clothes_data=data, image_path=str(image_path))
        return self._to_response(clothes)

    def get_user_clothes(
        self, user_id: int, season: Optional[Season] = None
    ) -> List[ClothesResponse]:
        return [self._to_response(c) for c in self._repo.get_by_user(user_id, season)]

    def get_by_id(self, clothes_id: int) -> ClothesResponse:
        clothes = self._repo.get_by_id(clothes_id)
        if not clothes:
            raise HTTPException(status_code=404, detail="Вещь не найдена")
        return self._to_response(clothes)

    def update_clothes(self, clothes_id: int, user_id: int, data: ClothesUpdate) -> ClothesResponse:
        clothes = self._repo.get_by_id(clothes_id)
        if not clothes or clothes.user_id != user_id:
            raise HTTPException(status_code=404, detail="Вещь не найдена")
        updated = self._repo.update(clothes_id, **data.model_dump(exclude_none=True))
        return self._to_response(updated)

    def delete_clothes(self, clothes_id: int, user_id: int) -> None:
        clothes = self._repo.get_by_id(clothes_id)
        if not clothes or clothes.user_id != user_id:
            raise HTTPException(status_code=404, detail="Вещь не найдена")
        path = Path(clothes.image_path)
        if path.exists():
            path.unlink()
        self._repo.delete(clothes_id)

    # ── internal ─────────────────────────────────────────────────────────────

    async def _save_as_jpg(self, file: UploadFile) -> Path:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Файл должен быть изображением")
        content = await file.read()
        try:
            img = Image.open(BytesIO(content))
        except Exception:
            raise HTTPException(status_code=400, detail="Не удалось открыть изображение")

        if img.mode not in ("RGB",):
            img = img.convert("RGB")

        filename = f"{uuid.uuid4()}.jpg"
        filepath = UPLOAD_DIR / filename
        img.save(filepath, "JPEG", quality=85, optimize=True)
        return filepath

    @staticmethod
    def _to_response(clothes: Clothes) -> ClothesResponse:
        return ClothesResponse(
            id=clothes.id,
            user_id=clothes.user_id,
            name=clothes.name,
            clothing_type=clothes.clothing_type,
            season=clothes.season,
            color=clothes.color,
            brand=clothes.brand,
            comment=clothes.comment,
            rating=clothes.rating,
            image_path=clothes.image_path,
            image_url=f"/{clothes.image_path}",
            created_at=clothes.created_at,
        )
