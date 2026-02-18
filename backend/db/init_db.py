from db.base import Base
from db.sessions import engine
from db.import_all_models import *


def init_db():
    Base.metadata.create_all(bind=engine)
