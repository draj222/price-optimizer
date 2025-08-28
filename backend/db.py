import os
import json
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    create_engine, Column, String, DateTime, JSON, text
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

DATABASE_URL = os.environ.get("DATABASE_URL")
Base = declarative_base()

class EstimateORM(Base):
    __tablename__ = "estimates"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    request_json = Column(JSON, nullable=False)
    result_json = Column(JSON, nullable=False)

if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
else:
    engine = None
    SessionLocal = None
    _memory_store = {}

def init_db():
    if engine:
        Base.metadata.create_all(engine)

def save_estimate(id: str, created_at: datetime, request_json: dict, result_json: dict):
    if engine:
        session = SessionLocal()
        try:
            est = EstimateORM(
                id=id,
                created_at=created_at,
                request_json=request_json,
                result_json=result_json,
            )
            session.add(est)
            session.commit()
        finally:
            session.close()
    else:
        _memory_store[id] = {
            "id": id,
            "created_at": created_at,
            "request_json": request_json,
            "result_json": result_json,
        }

def get_estimate(id: str) -> Optional[dict]:
    if engine:
        session = SessionLocal()
        try:
            est = session.query(EstimateORM).filter_by(id=id).first()
            if est:
                return {
                    "id": est.id,
                    "created_at": est.created_at,
                    "request_json": est.request_json,
                    "result_json": est.result_json,
                }
        finally:
            session.close()
    else:
        return _memory_store.get(id)
