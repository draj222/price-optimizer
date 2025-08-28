from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import uuid
import logging
from backend.models import EstimateRequest, EstimateResult
from backend.engine import estimate_price
from backend.deps import get_provider_dep

app = FastAPI()

# In-memory store for results
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
    estimate_store[est_id] = result.model_copy(update={"id": est_id})
    return estimate_store[est_id]

@app.get("/estimate/{id}", response_model=EstimateResult)
async def get_estimate(id: str):
    result = estimate_store.get(id)
    if not result:
        raise HTTPException(status_code=404, detail="Estimate not found")
    return result
