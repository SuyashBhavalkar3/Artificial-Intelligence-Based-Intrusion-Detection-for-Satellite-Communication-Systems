from sqlalchemy.orm import Session
from models.telemetry import Telemetry
from schema.telemetry import TelemetryCreate
from models.user import User
from models.satellite import Satellite


class TelemetryService:
    @staticmethod
    def ingest(
        db: Session,
        telemetry_in: TelemetryCreate,
        user: User
    ) -> Telemetry:
        satellite = (
            db.query(Satellite)
            .filter(
                Satellite.id == telemetry_in.satellite_id,
                Satellite.owner_id == user.id
            )
            .first()
        )

        if not satellite:
            raise ValueError("Satellite not found or access denied")

        telemetry = Telemetry(**telemetry_in.dict())

        db.add(telemetry)
        db.commit()
        db.refresh(telemetry)
        return telemetry