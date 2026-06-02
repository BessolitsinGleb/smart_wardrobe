from pydantic_settings import BaseSettings
class Settings_class(BaseSettings):
    DB_URL = "postgresql+asyncpg://aleksejbessolicin:market_password@market_db:5432/wardrobe"

Settings = Settings_class()