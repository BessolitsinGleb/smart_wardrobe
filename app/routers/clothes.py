from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.clothes_service import ClothesService
from app.schemas import ClothesResponse, ClothesUpdate
from app.models import ClothingType, Season

router = APIRouter(prefix="/api/clothes", tags=["clothes"])


@router.post("/upload", response_model=ClothesResponse, status_code=201)
async def upload_clothes(
    user_id: int = Form(...),
    name: str = Form(...),
    clothing_type: ClothingType = Form(...),
    season: Season = Form(Season.ALL_SEASON),
    color: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    comment: Optional[str] = Form(None),
    rating: float = Form(5.0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    from app.schemas import ClothesCreate
    data = ClothesCreate(
        name=name, clothing_type=clothing_type, season=season,
        color=color, brand=brand, comment=comment, rating=rating,
    )
    return await ClothesService(db).upload_clothes(user_id=user_id, file=file, data=data)


@router.get("/user/{user_id}", response_model=List[ClothesResponse])
def get_user_clothes(
    user_id: int,
    season: Optional[Season] = None,
    db: Session = Depends(get_db),
):
    return ClothesService(db).get_user_clothes(user_id=user_id, season=season)


@router.patch("/{clothes_id}", response_model=ClothesResponse)
def update_clothes(
    clothes_id: int,
    user_id: int,
    data: ClothesUpdate,
    db: Session = Depends(get_db),
):
    return ClothesService(db).update_clothes(clothes_id=clothes_id, user_id=user_id, data=data)


@router.delete("/{clothes_id}", status_code=204)
def delete_clothes(
    clothes_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    ClothesService(db).delete_clothes(clothes_id=clothes_id, user_id=user_id)
