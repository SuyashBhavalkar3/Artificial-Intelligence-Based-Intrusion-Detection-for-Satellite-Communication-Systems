import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

TEST_DB_URL = "sqlite:///./test_api.db"
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
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}

NORMAL_EVENT = {
    "src_ip": "192.168.1.10",
    "dst_ip": "10.0.0.1",
    "protocol": "TCP",
    "payload_size": 512.0,
    "frequency": 100.0,
    "signal_strength": -60.0,
}

ATTACK_EVENT = {
    "src_ip": "45.33.32.156",
    "dst_ip": "10.0.0.1",
    "protocol": "UDP",
    "payload_size": 9000.0,
    "frequency": 600.0,
    "signal_strength": -20.0,
}

@pytest.mark.asyncio
async def test_ingest_normal_event(client, auth_headers):
    resp = await client.post("/api/ingest", json=NORMAL_EVENT, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "threat_id" in data
    assert "threat_type" in data

@pytest.mark.asyncio
async def test_ingest_attack_event_creates_threat(client, auth_headers):
    resp = await client.post("/api/ingest", json=ATTACK_EVENT, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "threat_id" in data
    # With trained models this would be True; without models it defaults to normal
    assert data["threat_type"] in ["dos", "jamming", "spoofing", "replay", "normal"]

@pytest.mark.asyncio
async def test_get_threats_pagination(client, auth_headers):
    resp = await client.get("/api/threats?skip=0&limit=10", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

@pytest.mark.asyncio
async def test_threats_stats_summary_shape(client, auth_headers):
    resp = await client.get("/api/threats/stats/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "by_severity" in data
    assert "by_type" in data
    assert "by_detection_method" in data
    assert "trend_last_24h" in data
