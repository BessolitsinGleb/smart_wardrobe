import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base


class ClothingType(str, enum.Enum):
    TSHIRT = "tshirt"
    SHIRT = "shirt"
    HOODIE = "hoodie"
    SWEATER = "sweater"
    JACKET = "jacket"
    COAT = "coat"
    PANTS = "pants"
    JEANS = "jeans"
    SHORTS = "shorts"
    DRESS = "dress"
    SKIRT = "skirt"
    SHOES = "shoes"
    SOCKS = "socks"
    UNDERWEAR = "underwear"
    HAT = "hat"
    SCARF = "scarf"
    GLOVES = "gloves"
    BAG = "bag"
    ACCESSORIES = "accessories"


class Season(str, enum.Enum):
    SPRING = "spring"
    SUMMER = "summer"
    AUTUMN = "autumn"
    WINTER = "winter"
    ALL_SEASON = "all_season"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    clothes = relationship("Clothes", back_populates="owner", cascade="all, delete-orphan")
    outfits = relationship("Outfit", back_populates="owner", cascade="all, delete-orphan")


class Clothes(Base):
    __tablename__ = "clothes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    clothing_type = Column(SAEnum(ClothingType), nullable=False)
    season = Column(SAEnum(Season), nullable=False, default=Season.ALL_SEASON)
    color = Column(String(50), nullable=True)
    brand = Column(String(100), nullable=True)
    # Личный комментарий пользователя к вещи
    comment = Column(Text, nullable=True)
    # Рейтинг 1–10: чем выше — тем чаще предлагается в аутфитах
    rating = Column(Float, nullable=False, default=5.0)
    image_path = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="clothes")
    outfit_items = relationship("OutfitItem", back_populates="clothes")


class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=True)
    # AI-комментарий: почему этот аутфит крутой
    ai_comment = Column(Text, nullable=True)
    season = Column(SAEnum(Season), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="outfits")
    items = relationship("OutfitItem", back_populates="outfit", cascade="all, delete-orphan")


class OutfitItem(Base):
    """Связь между аутфитом и конкретными вещами из Clothes."""
    __tablename__ = "outfit_items"

    id = Column(Integer, primary_key=True, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id"), nullable=False)
    clothes_id = Column(Integer, ForeignKey("clothes.id"), nullable=False)

    outfit = relationship("Outfit", back_populates="items")
    clothes = relationship("Clothes", back_populates="outfit_items")
