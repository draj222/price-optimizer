import math
from typing import List
from models import AddressSpec, PropertySpec, EstimateResult, Comp
from providers.base import CompProvider
from datetime import datetime, date

async def estimate_price(address: AddressSpec, prop: PropertySpec, provider: CompProvider) -> EstimateResult:
    # 1) Fetch comps (radius 3km, days 180, same property type)
    comps: List[Comp] = await provider.get_comps(address, prop, radius_km=3.0, days=180)
    comps = [c for c in comps if c.property_type == prop.type]
    if not comps:
        raise ValueError("No comparable properties found.")

    adjusted = []
    for c in comps:
        # 2) Size adjust
        adj = c.price * (prop.sqft / max(c.sqft, 300)) ** 0.25
        # 3) Condition adjust
        adj *= (1 + 0.02 * (prop.condition - 3))
        # 4) Scores
        proximity = math.exp(-c.distance_km / 1.5)
        size_sim = math.exp(-abs(prop.sqft - c.sqft) / 600)
        days_ago = (date.today() - c.closed_or_listed_date).days
        recency = math.exp(-days_ago / 60)
        score = 0.5 * proximity + 0.3 * size_sim + 0.2 * recency
        adjusted.append({
            "comp": c,
            "adjusted_price": adj,
            "score": score
        })

    # Sort by score, take top 10
    adjusted.sort(key=lambda x: x["score"], reverse=True)
    top = adjusted[:10]
    adj_prices = [x["adjusted_price"] for x in top]
    comps_out = []
    for x in top:
        comp = x["comp"]
        comp_dict = comp.model_dump()
        comp_dict["adjusted_price"] = x["adjusted_price"]
        comps_out.append(comp.__class__(**comp_dict))

    # 5) Weighted median, P25, P75
    def weighted_percentile(data, weights, percent):
        """Compute weighted percentile (percent in [0,1])"""
        i = sorted(zip(data, weights), key=lambda x: x[0])
        data, weights = zip(*i)
        cumw = [0] + list(math.fsum(weights[:j+1]) for j in range(len(weights)))
        total = cumw[-1]
        for idx, cw in enumerate(cumw[1:]):
            if cw / total >= percent:
                return data[idx]
        return data[-1]

    scores = [x["score"] for x in top]
    median = weighted_percentile(adj_prices, scores, 0.5)
    p25 = weighted_percentile(adj_prices, scores, 0.25)
    p75 = weighted_percentile(adj_prices, scores, 0.75)

    # 6) Confidence
    iqr = p75 - p25
    conf = "low"
    n = len(top)
    if n >= 10 and median > 0 and iqr / median < 0.18:
        conf = "high"
    elif n >= 6 and median > 0 and iqr / median < 0.28:
        conf = "medium"

    return EstimateResult(
        id=f"est-{datetime.utcnow().isoformat()}",
        point_estimate=median,
        range_low=p25,
        range_high=p75,
        confidence=conf,
        comps=comps_out,
        adjustments={},
        created_at=datetime.utcnow(),
    )
