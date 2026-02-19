from datetime import datetime
import pytz

IST = pytz.timezone("Asia/Kolkata")

def utc_to_ist(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        dt = pytz.utc.localize(dt)
    return dt.astimezone(IST)