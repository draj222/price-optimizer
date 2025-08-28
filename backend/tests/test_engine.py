import pytest
import asyncio
from backend.models import AddressSpec, PropertySpec
from backend.providers.fake import FakeProvider
from backend.engine import estimate_price
from backend.main import app
from fastapi.testclient import TestClient

@pytest.mark.asyncio
async def test_estimate_price_determinism():
    address = AddressSpec(street="1 Main St", city="Testville", state="CA", zip="12345")
    prop = PropertySpec(beds=3, baths=2.0, sqft=1200, type="condo", condition=3, tenure="sale")
    provider = FakeProvider()
    result1 = await estimate_price(address, prop, provider)
    result2 = await estimate_price(address, prop, provider)
    assert result1.point_estimate == result2.point_estimate
    assert result1.range_low == result2.range_low
    assert result1.range_high == result2.range_high
    assert result1.confidence == result2.confidence
    assert len(result1.comps) == len(result2.comps)

@pytest.mark.asyncio
async def test_estimate_price_monotonicity_condition():
    address = AddressSpec(street="1 Main St", city="Testville", state="CA", zip="12345")
    provider = FakeProvider()
    prop_low = PropertySpec(beds=3, baths=2.0, sqft=1200, type="condo", condition=2, tenure="sale")
    prop_mid = PropertySpec(beds=3, baths=2.0, sqft=1200, type="condo", condition=3, tenure="sale")
    prop_high = PropertySpec(beds=3, baths=2.0, sqft=1200, type="condo", condition=5, tenure="sale")
    est_low = await estimate_price(address, prop_low, provider)
    est_mid = await estimate_price(address, prop_mid, provider)
    est_high = await estimate_price(address, prop_high, provider)
    assert est_low.point_estimate < est_mid.point_estimate < est_high.point_estimate

@pytest.mark.asyncio
async def test_estimate_price_monotonicity_sqft():
    address = AddressSpec(street="1 Main St", city="Testville", state="CA", zip="12345")
    provider = FakeProvider()
    prop_small = PropertySpec(beds=3, baths=2.0, sqft=900, type="condo", condition=3, tenure="sale")
    prop_mid = PropertySpec(beds=3, baths=2.0, sqft=1200, type="condo", condition=3, tenure="sale")
    prop_large = PropertySpec(beds=3, baths=2.0, sqft=1800, type="condo", condition=3, tenure="sale")
    est_small = await estimate_price(address, prop_small, provider)
    est_mid = await estimate_price(address, prop_mid, provider)
    est_large = await estimate_price(address, prop_large, provider)
    assert est_small.point_estimate < est_mid.point_estimate < est_large.point_estimate

def test_post_get_roundtrip():
    client = TestClient(app)
    req = {
        "address": {"street": "1 Main St", "city": "Testville", "state": "CA", "zip": "12345"},
        "property": {"beds": 3, "baths": 2.0, "sqft": 1200, "type": "condo", "condition": 3, "tenure": "sale"}
    }
    resp = client.post("/estimate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    est_id = data["id"]
    get_resp = client.get(f"/estimate/{est_id}")
    assert get_resp.status_code == 200
    data2 = get_resp.json()
    assert data2["id"] == est_id
    assert data2["point_estimate"] == data["point_estimate"]
