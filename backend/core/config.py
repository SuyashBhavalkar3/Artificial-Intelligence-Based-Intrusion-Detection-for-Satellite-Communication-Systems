from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Reserved user ID for AI system (threat creation without human authorization)
    AI_SYSTEM_USER_ID: int = 999

    class Config:
        env_file = ".env"


settings = Settings()