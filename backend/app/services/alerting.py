import smtplib
import logging
import httpx
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from sqlalchemy.orm import Session
from app.models.tables import Alert, AlertChannel, Threat, Severity
from app.config import settings

logger = logging.getLogger(__name__)

def _already_alerted(threat: Threat, db: Session) -> bool:
    # De-duplicate: skip if same threat_type alerted within last 5 minutes
    cutoff = datetime.utcnow() - timedelta(minutes=5)
    recent = (
        db.query(Alert)
        .join(Threat, Alert.threat_id == Threat.id)
        .filter(Threat.threat_type == threat.threat_type, Alert.sent_at >= cutoff)
        .first()
    )
    return recent is not None

def _send_email(message: str):
    try:
        msg = MIMEText(message)
        msg["Subject"] = "IDS Critical Alert"
        msg["From"] = settings.SMTP_USER
        msg["To"] = settings.ALERT_EMAIL_TO
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [settings.ALERT_EMAIL_TO], msg.as_string())
    except Exception as e:
        logger.error(f"Email send failed: {e}")

def _send_slack(message: str):
    try:
        httpx.post(settings.SLACK_WEBHOOK_URL, json={"text": message}, timeout=5)
    except Exception as e:
        logger.error(f"Slack send failed: {e}")

def _save_alert(threat: Threat, channel: AlertChannel, message: str, db: Session):
    alert = Alert(threat_id=threat.id, channel=channel, message=message)
    db.add(alert)
    db.commit()

def dispatch_alert(threat: Threat, db: Session):
    if _already_alerted(threat, db):
        logger.info(f"Alert de-duplicated for threat_type={threat.threat_type}")
        _save_alert(threat, AlertChannel.log, "De-duplicated alert (not sent)", db)
        return

    message = (
        f"[IDS ALERT] Threat: {threat.threat_type.value} | "
        f"Severity: {threat.severity.value} | "
        f"Confidence: {threat.confidence:.2%} | "
        f"Threat ID: {threat.id}"
    )

    if threat.severity == Severity.critical:
        _send_email(message)
        _send_slack(message)
        _save_alert(threat, AlertChannel.email, message, db)
        _save_alert(threat, AlertChannel.slack, message, db)
    elif threat.severity == Severity.high:
        _send_slack(message)
        _save_alert(threat, AlertChannel.slack, message, db)
    else:
        logger.info(f"Alert logged only: {message}")
        _save_alert(threat, AlertChannel.log, message, db)
