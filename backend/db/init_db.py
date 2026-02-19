from db.base import Base
from db.sessions import engine, SessionLocal
from db.import_all_models import *
from models.user import User
from core.config import settings
from core.security import get_password_hash


def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Ensure AI system user exists
    db = SessionLocal()
    try:
        ai_user = db.query(User).filter(User.id == settings.AI_SYSTEM_USER_ID).first()
        if not ai_user:
            ai_user = User(
                id=settings.AI_SYSTEM_USER_ID,
                username="ai_system",
                email="ai@system.local",
                hashed_password=get_password_hash("DISABLED"),  # Password disabled
                is_superuser=True,  # System-level access
                is_active=True
            )
            db.add(ai_user)
            db.commit()
            print(f"[INIT_DB] Created AI system user with ID={settings.AI_SYSTEM_USER_ID}")
    finally:
        db.close()
