from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models import ClothingType, Season


# ── Users ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Clothes ───────────────────────────────────────────────────────────────────

class ClothesCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    clothing_type: ClothingType
    season: Season = Season.ALL_SEASON
    color: Optional[str] = None
    brand: Optional[str] = None
    comment: Optional[str] = None
    rating: float = Field(default=5.0, ge=1.0, le=10.0)


class ClothesUpdate(BaseModel):
    name: Optional[str] = None
    clothing_type: Optional[ClothingType] = None
    season: Optional[Season] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    comment: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=1.0, le=10.0)


class ClothesResponse(BaseModel):
    id: int
    user_id: int
    name: str
    clothing_type: ClothingType
    season: Season
    color: Optional[str] = None
    brand: Optional[str] = None
    comment: Optional[str] = None
    rating: float
    image_path: str
    image_url: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Outfits ───────────────────────────────────────────────────────────────────

class OutfitGenerateRequest(BaseModel):
    user_id: int
    season: Optional[Season] = None
    occasion: Optional[str] = None  # casual / formal / sport / date / etc.


class OutfitItemResponse(BaseModel):
    clothes: ClothesResponse

    model_config = {"from_attributes": True}


class OutfitResponse(BaseModel):
    id: int
    user_id: int
    name: Optional[str] = None
    ai_comment: Optional[str] = None
    season: Optional[Season] = None
    items: List[OutfitItemResponse]
    created_at: datetime

    model_config = {"from_attributes": True}
