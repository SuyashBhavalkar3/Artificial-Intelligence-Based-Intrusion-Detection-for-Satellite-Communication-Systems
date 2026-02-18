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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Satellite Cybersecurity API!",
            "endpoints": {
                "/api/v1/satellites": "Manage satellites",
                "/api/v1/threats": "Manage threats",
                "/api/v1/auth": "User authentication"
            },
            "documentation": "/docs",
            "redoc": "/redoc",
            "version": "1.0.0",
            "contact": {
                "name": "Suyash Bhavalkar",
                "email": "suyash.bhavalkar82@gmail.com"
            }
    }
