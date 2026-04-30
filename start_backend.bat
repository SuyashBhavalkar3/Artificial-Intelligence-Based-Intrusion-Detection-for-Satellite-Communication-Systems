@echo off
TITLE Satellite IDS - Backend
echo Starting Backend Server...
cd backend
call ..\satellite_env\Scripts\activate
uvicorn app.main:app --reload
pause
