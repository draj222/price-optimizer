from typing import Literal, List, Dict, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator, model_validator

__all__ = [
    "AddressSpec",
    "PropertySpec",
    "EstimateRequest",
    "Comp",
    "EstimateResult",
]

class AddressSpec(BaseModel):
    street: str
    city: str
    state: str
    zip: str

class PropertySpec(BaseModel):
    beds: int = Field(..., ge=0)
    baths: float = Field(..., ge=0)
    sqft: int = Field(..., ge=300)
    type: Literal["apartment", "condo", "single_family", "townhome"]
    condition: int = Field(..., ge=1, le=5)
    tenure: Literal["rent", "sale"]

    @field_validator("baths")
    @classmethod
    def baths_half_steps(cls, v):
        if v * 2 != int(v * 2):
            raise ValueError("Baths must be in 0.5 increments")
        return v

class EstimateRequest(BaseModel):
    address: AddressSpec
    property: PropertySpec

class Comp(BaseModel):
    id: str
    address: str
    distance_km: float = Field(..., ge=0)
    beds: int = Field(..., ge=0)
    baths: float = Field(..., ge=0)
    sqft: int = Field(..., ge=300)
    price: float = Field(..., ge=0)
    closed_or_listed_date: date
    property_type: Literal["apartment", "condo", "single_family", "townhome"]
    source: str

    @field_validator("baths")
    @classmethod
    def baths_half_steps(cls, v):
        if v * 2 != int(v * 2):
            raise ValueError("Baths must be in 0.5 increments")
        return v

class EstimateResult(BaseModel):
    id: str
    point_estimate: float
    range_low: float
    range_high: float
    confidence: Literal["low", "medium", "high"]
    comps: List[Comp]
    adjustments: Dict[str, float]
    created_at: datetime

    @model_validator(mode="after")
    def check_range(self):
        if not (self.range_low <= self.point_estimate <= self.range_high):
            raise ValueError("point_estimate must be between range_low and range_high")
        return self
