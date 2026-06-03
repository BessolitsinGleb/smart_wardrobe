from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Clothes, Season
from app.schemas import ClothesCreate


class ClothesRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, clothes_data: ClothesCreate, image_path: str) -> Clothes:
        clothes = Clothes(user_id=user_id, image_path=image_path, **clothes_data.model_dump())
        self.db.add(clothes)
        self.db.commit()
        self.db.refresh(clothes)
        return clothes

    def get_by_id(self, clothes_id: int) -> Optional[Clothes]:
        return self.db.query(Clothes).filter(Clothes.id == clothes_id).first()

    def get_by_user(self, user_id: int, season: Optional[Season] = None) -> List[Clothes]:
        q = self.db.query(Clothes).filter(Clothes.user_id == user_id)
        if season:
            q = q.filter(
                (Clothes.season == season) | (Clothes.season == Season.ALL_SEASON)
            )
        return q.order_by(Clothes.created_at.desc()).all()

    def update(self, clothes_id: int, **kwargs) -> Optional[Clothes]:
        clothes = self.get_by_id(clothes_id)
        if not clothes:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(clothes, key, value)
        self.db.commit()
        self.db.refresh(clothes)
        return clothes

    def delete(self, clothes_id: int) -> bool:
        clothes = self.get_by_id(clothes_id)
        if not clothes:
            return False
        self.db.delete(clothes)
        self.db.commit()
        return True
