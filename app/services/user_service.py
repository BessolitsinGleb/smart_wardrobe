import hashlib
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.user_repository import UserRepository
from app.schemas import UserCreate, UserResponse


class UserService:
    def __init__(self, db: Session):
        self._repo = UserRepository(db)

    def create_user(self, data: UserCreate) -> UserResponse:
        if self._repo.get_by_username(data.username):
            raise HTTPException(status_code=400, detail="Имя пользователя уже занято")
        if self._repo.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
        hashed = hashlib.pbkdf2_hmac("sha256", data.password.encode(), b"sw_salt", 100_000).hex()
        user = self._repo.create(username=data.username, email=data.email, hashed_password=hashed)
        return UserResponse.model_validate(user)

    def get_user(self, user_id: int) -> UserResponse:
        user = self._repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        return UserResponse.model_validate(user)
