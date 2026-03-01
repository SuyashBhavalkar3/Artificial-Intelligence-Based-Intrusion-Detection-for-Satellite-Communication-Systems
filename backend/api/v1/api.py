from fastapi import APIRouter
from api.v1.endpoints import auth, satellites, threat, telemetry, wallet_auth

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(satellites.router)
api_router.include_router(threat.router)
api_router.include_router(telemetry.router)
api_router.include_router(wallet_auth.router)