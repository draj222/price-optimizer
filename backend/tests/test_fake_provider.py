import pytest
from backend.models import AddressSpec, PropertySpec
from backend.providers.fake import FakeProvider
import asyncio

@pytest.mark.asyncio
async def test_fake_provider_comps_count():
    address = AddressSpec(street="1 Main St", city="Testville", state="CA", zip="12345")
    prop = PropertySpec(beds=3, baths=2.0, sqft=1200, type="condo", condition=3, tenure="sale")
    provider = FakeProvider()
    comps = await provider.get_comps(address, prop, radius_km=3.0, days=90)
    assert 8 <= len(comps) <= 20
    # Deterministic: same input yields same count
    comps2 = await provider.get_comps(address, prop, radius_km=3.0, days=90)
    assert len(comps) == len(comps2)
    assert all(0.2 <= c.distance_km <= 4.0 for c in comps)
    assert all(c.price > 0 for c in comps)
