import os
from .base import CompProvider
from .fake import FakeProvider

def get_provider() -> CompProvider:
    provider = os.environ.get("PROVIDER", "fake")
    if provider == "fake":
        return FakeProvider()
    raise ValueError(f"Unknown provider: {provider}")
