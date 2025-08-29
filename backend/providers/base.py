from typing import Protocol, List
from models import AddressSpec, PropertySpec, Comp

class CompProvider(Protocol):
    async def get_comps(
        self,
        address: AddressSpec,
        property: PropertySpec,
        *,
        radius_km: float,
        days: int
    ) -> List[Comp]:
        ...
