from fastapi import FastAPI
from api.v1.api import api_router

app = FastAPI(
    title="Satellite Cybersecurity API",
    version="1.0.0"
)

app.include_router(api_router, prefix="/api/v1")

from db.init_db import init_db

@app.on_event("startup")
def on_startup():
    init_db()
