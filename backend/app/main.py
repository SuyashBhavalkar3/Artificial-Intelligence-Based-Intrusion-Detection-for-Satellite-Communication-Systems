import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import init_db, SessionLocal
from app.config import settings
from app.auth.router import router as auth_router
from app.api.ingest import router as ingest_router
from app.api.threats import router as threats_router
from app.api.alerts import router as alerts_router
from app.api.llm import router as llm_router

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _create_default_admin(db: Session):
    from app.models.tables import User
    if not db.query(User).filter(User.username == "admin").first():
        db.add(User(
            username="admin",
            hashed_password=pwd_context.hash("admin123"),
            role="admin",
        ))
        db.commit()
        logger.info("Default admin user created (username=admin, password=admin123)")

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        _create_default_admin(db)
    finally:
        db.close()
    yield

app = FastAPI(title="Satellite IDS", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def timing_and_logging(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} {response.status_code} {duration}ms")
    response.headers["X-Process-Time"] = str(duration)
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"error": type(exc).__name__, "detail": str(exc)})

app.include_router(auth_router)
app.include_router(ingest_router, prefix="/api")
app.include_router(threats_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(llm_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
