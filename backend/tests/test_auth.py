import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

TEST_DB_URL = "sqlite:///./test_ids.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True, scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    # Create admin user for tests
    from passlib.context import CryptContext
    from app.models.tables import User
    db = TestSession()
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    if not db.query(User).filter(User.username == "admin").first():
        db.add(User(username="admin", hashed_password=pwd.hash("admin123"), role="admin"))
        db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

@pytest_asyncio.fixture
async def auth_headers(client):
    resp = await client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_login_success(client):
    resp = await client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()

@pytest.mark.asyncio
async def test_login_wrong_password(client):
    resp = await client.post("/auth/login", json={"username": "admin", "password": "wrong"})
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_protected_route_with_token(client, auth_headers):
    resp = await client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["username"] == "admin"

@pytest.mark.asyncio
async def test_protected_route_without_token(client):
    resp = await client.get("/auth/me")
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_token_refresh(client, auth_headers):
    login_resp = await client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    refresh_token = login_resp.json()["refresh_token"]
    resp = await client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()
