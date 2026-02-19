from sqlalchemy.orm import Session
from typing import Optional

from models.audit_log import AuditLog
from models.user import User


class AuditService:
    @staticmethod
    def log(
        db: Session,
        action: str,
        resource: str,
        user: Optional[User] = None,
        details: Optional[str] = None
    ):
        log_entry = AuditLog(
            user_id=user.id if user else None,
            action=action,
            resource=resource,
            details=details
        )

        db.add(log_entry)
        db.commit()