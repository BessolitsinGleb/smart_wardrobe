from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.outfit_service import OutfitService
from app.schemas import OutfitGenerateRequest, OutfitResponse

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


@router.post("/generate", response_model=OutfitResponse, status_code=201)
def generate_outfit(request: OutfitGenerateRequest, db: Session = Depends(get_db)):
    """Собирает аутфит через ИИ и сохраняет в историю."""
    return OutfitService(db).generate(request)


@router.get("/user/{user_id}", response_model=List[OutfitResponse])
def get_user_outfits(user_id: int, db: Session = Depends(get_db)):
    return OutfitService(db).get_user_outfits(user_id)


@router.delete("/{outfit_id}", status_code=204)
def delete_outfit(outfit_id: int, user_id: int, db: Session = Depends(get_db)):
    OutfitService(db).delete_outfit(outfit_id=outfit_id, user_id=user_id)
