from fastapi import Depends
from backend.providers import get_provider, CompProvider

def get_provider_dep() -> CompProvider:
    return get_provider()
