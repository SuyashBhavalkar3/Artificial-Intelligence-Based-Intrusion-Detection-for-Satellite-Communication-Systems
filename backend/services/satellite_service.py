from typing import List, Optional
from sqlalchemy.orm import Session

from models.satellite import Satellite
from schema.satellite import SatelliteCreate
from models.user import User


class SatelliteService:
    @staticmethod
    def create_satellite(
        db: Session,
        satellite_in: SatelliteCreate,
        owner: User
    ) -> Satellite:
        satellite = Satellite(
            name=satellite_in.name,
            orbit_type=satellite_in.orbit_type,
            operator=satellite_in.operator,
            owner_id=owner.id
        )

        db.add(satellite)
        db.commit()
        db.refresh(satellite)
        return satellite

    @staticmethod
    def get_satellite_by_id(
        db: Session,
        satellite_id: int,
        owner: User
    ) -> Optional[Satellite]:
        return (
            db.query(Satellite)
            .filter(
                Satellite.id == satellite_id,
                Satellite.owner_id == owner.id
            )
            .first()
        )

    @staticmethod
    def list_satellites(
        db: Session,
        owner: User
    ) -> List[Satellite]:
        return (
            db.query(Satellite)
            .filter(Satellite.owner_id == owner.id)
            .all()
        )
    
    @staticmethod
    def list_all_satellites(db: Session):
        return db.query(Satellite).all()