import json
from fastapi import WebSocket
from app.services.security_service import security_service

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections = [c for c in self.active_connections if c != websocket]

    async def broadcast(self, message: dict, encrypt: bool = False):
        if encrypt:
            # Encrypt the message before broadcasting
            encrypted_data = security_service.encrypt_payload(message)
            signature = security_service.sign_command(encrypted_data)
            payload = {
                "secure": True,
                "data": encrypted_data,
                "signature": signature
            }
        else:
            payload = message

        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(payload))
            except Exception:
                dead.append(connection)
        for c in dead:
            self.disconnect(c)

    async def broadcast_threat(self, threat: dict):
        # We broadcast threats securely by default now
        await self.broadcast({"type": "new_threat", "data": threat}, encrypt=True)

manager = ConnectionManager()
