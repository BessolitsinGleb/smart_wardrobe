from pydantic import BaseModel
from sqlalchemy.orm import Mapped, mapped_column
from enum import Enum

class User(BaseModel):
    ...


class Clothes_types(Enum):

    trousers = "trousers"
    t_shirt = "t_shirt"
    shoes = "shoes"
    socks = "socks"
    sweater = "sweater"
    ...

class Clothes(BaseModel):

    __tablename__ = "clothes_data"

    clothes_id: Mapped[int] = mapped_column(primary_key=True)
    picture_file: Mapped[str] = mapped_column(unique=True)
    clothes_type: Mapped[Clothes_types] = mapped_column(nullable=False)
    score_clothing: Mapped[float] = mapped_column(default=5.0)
    ...

class Outfits(BaseModel):

    __tablename__ = "outfits"

    outfit_id: Mapped[int] = mapped_column(primary_key=True)
    ...