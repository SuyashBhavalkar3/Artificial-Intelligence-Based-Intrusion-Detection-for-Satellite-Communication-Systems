from typing import List, Optional
from sqlalchemy.orm import Session

from  models.threats import Threat
from  schema.threats import ThreatCreate
from  models.user import User
from  models.satellite import Satellite


class ThreatService:
    @staticmethod
    def create_threat(
        db: Session,
        threat_in: ThreatCreate,
        reporter: User
    ) -> Threat:
        # DEBUG: Log threat creation attempt
        print(f"[THREAT_SERVICE] create_threat() called:")
        print(f"  satellite_id={threat_in.satellite_id}, reporter.id={reporter.id}, reporter_type={type(reporter)}")
        
        # AI system user (id=999) bypasses ownership check; human reporters must own satellite
        satellite = None
        if reporter.id == 999:
            # AI system: just verify satellite exists
            satellite = db.query(Satellite).filter(
                Satellite.id == threat_in.satellite_id
            ).first()
            if not satellite:
                error_msg = f"Satellite not found (id={threat_in.satellite_id})"
                print(f"[THREAT_SERVICE] {error_msg}")
                raise ValueError(error_msg)
        else:
            # Human reporter: must own the satellite
            satellite = (
                db.query(Satellite)
                .filter(
                    Satellite.id == threat_in.satellite_id,
                    Satellite.owner_id == reporter.id
                )
                .first()
            )
            if not satellite:
                error_msg = f"Satellite not found or access denied (id={threat_in.satellite_id}, owner_id should be {reporter.id})"
                print(f"[THREAT_SERVICE] {error_msg}")
                raise ValueError(error_msg)

        print(f"[THREAT_SERVICE] Ownership query result: satellite={satellite}")

        threat = Threat(
            title=threat_in.title,
            description=threat_in.description,
            threat_type=threat_in.threat_type,
            severity=threat_in.severity,
            satellite_id=threat_in.satellite_id,
            reported_by_id=reporter.id
        )

        db.add(threat)
        db.commit()
        db.refresh(threat)
        return threat

    @staticmethod
    def list_threats(
        db: Session,
        reporter: User
    ) -> List[Threat]:
        return (
            db.query(Threat)
            .join(Satellite)
            .filter(Satellite.owner_id == reporter.id)
            .all()
        )

    @staticmethod
    def get_threat_by_id(
        db: Session,
        threat_id: int,
        reporter: User
    ) -> Optional[Threat]:
        return (
            db.query(Threat)
            .join(Satellite)
            .filter(
                Threat.id == threat_id,
                Satellite.owner_id == reporter.id
            )
            .first()
        )
    
    @staticmethod
    def list_all_threats(db: Session):
        return db.query(Threat).all()
    
    @staticmethod
    def update_threat_status(
        db: Session,
        threat_id: int,
        new_status: str
    ) -> Threat:
        allowed_statuses = ["DETECTED", "MITIGATED", "RESOLVED"]

        if new_status not in allowed_statuses:
            raise ValueError("Invalid threat status")

        threat = db.query(Threat).filter(Threat.id == threat_id).first()
        if not threat:
            raise ValueError("Threat not found")

        # Enforce forward-only lifecycle
        current_index = allowed_statuses.index(threat.status)
        new_index = allowed_statuses.index(new_status)

        if new_index < current_index:
            raise ValueError("Invalid status transition")

        threat.status = new_status
        db.commit()
        db.refresh(threat)
        return threat