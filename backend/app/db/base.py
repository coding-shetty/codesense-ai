from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models import Base
from app.config import settings

# Setup SQLite for local dev, easy to swap to Postgres for production
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Creates all tables in the database."""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency to yield a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()