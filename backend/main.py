from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import uuid
import logging
from models import EstimateRequest, EstimateResult
from engine import estimate_price
from deps import get_provider_dep
import db
import os

app = FastAPI()

db.init_db()

# In-memory store for results (fallback if no DB)
estimate_store = {}

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured logging middleware
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        req_id = str(uuid.uuid4())
        start = time.time()
        response = None
        try:
            response = await call_next(request)
            return response
        finally:
            duration = (time.time() - start) * 1000
            logging.info(
                f"request_id={req_id} method={request.method} path={request.url.path} status={getattr(response, 'status_code', None)} duration_ms={duration:.2f}"
            )

app.add_middleware(LoggingMiddleware)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/estimate", response_model=EstimateResult)
async def post_estimate(
    req: EstimateRequest,
    provider=Depends(get_provider_dep),
):
    result = await estimate_price(req.address, req.property, provider)
    est_id = str(uuid.uuid4())
    result_with_id = result.model_copy(update={"id": est_id})
    # Store in DB or memory
    db.save_estimate(
        id=est_id,
        created_at=result_with_id.created_at,
        request_json=req.model_dump(),
        result_json=result_with_id.model_dump(),
    )
    return result_with_id

@app.get("/estimate/{id}", response_model=EstimateResult)
async def get_estimate(id: str):
    est = db.get_estimate(id)
    if not est:
        raise HTTPException(status_code=404, detail="Estimate not found")
    # Return result_json as EstimateResult
    return EstimateResult(**est["result_json"])
