import random
from datetime import date, timedelta
from typing import List
from models import AddressSpec, PropertySpec, Comp
from .base import CompProvider

class FakeProvider:
    async def get_comps(
        self,
        address: AddressSpec,
        property: PropertySpec,
        *,
        radius_km: float,
        days: int
    ) -> List[Comp]:
        # Deterministic seed
        seed = f"{address.zip}-{property.sqft}-{property.tenure}"
        rng = random.Random(seed)
        n = rng.randint(8, 20)
        today = date.today()
        comps = []
        for i in range(n):
            dist = round(rng.uniform(0.2, min(radius_km, 4.0)), 2)
            recency = rng.randint(0, min(days, 120))
            closed_or_listed_date = today - timedelta(days=recency)
            # Price logic
            base_price = 200_000 + property.sqft * rng.uniform(100, 400)
            if property.tenure == "rent":
                price = round(base_price / 200, -1)  # e.g. $1,000–$4,000
            else:
                price = round(base_price, -3)  # e.g. $300,000–$1,000,000
            comp = Comp(
                id=f"fake-{i}",
                address=f"{i+1} Example St, {address.city}, {address.state} {address.zip}",
                distance_km=dist,
                beds=property.beds,
                baths=property.baths,
                sqft=property.sqft + rng.randint(-100, 100),
                price=price,
                closed_or_listed_date=closed_or_listed_date,
                property_type=property.type,
                source="fake",
            )
            comps.append(comp)
        return comps
