from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models import Outfit, OutfitItem, Season


class OutfitRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        user_id: int,
        clothes_ids: List[int],
        ai_comment: str,
        name: Optional[str] = None,
        season: Optional[Season] = None,
    ) -> Outfit:
        outfit = Outfit(user_id=user_id, ai_comment=ai_comment, name=name, season=season)
        self.db.add(outfit)
        self.db.flush()
        for clothes_id in clothes_ids:
            self.db.add(OutfitItem(outfit_id=outfit.id, clothes_id=clothes_id))
        self.db.commit()
        self.db.refresh(outfit)
        return self._load_with_items(outfit.id)

    def get_by_id(self, outfit_id: int) -> Optional[Outfit]:
        return self._load_with_items(outfit_id)

    def get_by_user(self, user_id: int) -> List[Outfit]:
        return (
            self.db.query(Outfit)
            .options(joinedload(Outfit.items).joinedload(OutfitItem.clothes))
            .filter(Outfit.user_id == user_id)
            .order_by(Outfit.created_at.desc())
            .all()
        )

    def delete(self, outfit_id: int) -> bool:
        outfit = self.db.query(Outfit).filter(Outfit.id == outfit_id).first()
        if not outfit:
            return False
        self.db.delete(outfit)
        self.db.commit()
        return True

    def _load_with_items(self, outfit_id: int) -> Optional[Outfit]:
        return (
            self.db.query(Outfit)
            .options(joinedload(Outfit.items).joinedload(OutfitItem.clothes))
            .filter(Outfit.id == outfit_id)
            .first()
        )
