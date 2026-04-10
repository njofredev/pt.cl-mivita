import os
from sqlalchemy import create_engine, Column, String, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_HOST = os.getenv("POSTGRES_HOST")
DB_NAME = os.getenv("POSTGRES_DATABASE")
DB_USER = os.getenv("POSTGRES_USER")
DB_PASS = os.getenv("POSTGRES_PASSWORD")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ConsultationLog(Base):
    __tablename__ = "mivita_consultations"

    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String, index=True)
    status = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        return True
    except Exception as e:
        print(f"Error initializing DB: {e}")
        return False

def log_consultation(rut: str, status: str):
    db = SessionLocal()
    try:
        log_entry = ConsultationLog(rut=rut, status=status)
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"Error logging to DB: {e}")
    finally:
        db.close()

def get_all_logs():
    db = SessionLocal()
    try:
        return db.query(ConsultationLog).order_by(ConsultationLog.timestamp.desc()).all()
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return []
    finally:
        db.close()
