import pytest
import models
from pydantic import ValidationError

def test_propertyspec_baths_half_steps():
    # Valid
    models.PropertySpec(
        beds=2, baths=2.5, sqft=900, type="condo", condition=3, tenure="rent"
    )
    # Invalid
    with pytest.raises(ValidationError):
        models.PropertySpec(
            beds=2, baths=2.3, sqft=900, type="condo", condition=3, tenure="rent"
        )

def test_propertyspec_sqft_min():
    with pytest.raises(ValidationError):
        models.PropertySpec(
            beds=2, baths=2.0, sqft=299, type="condo", condition=3, tenure="rent"
        )

def test_propertyspec_condition_range():
    with pytest.raises(ValidationError):
        models.PropertySpec(
            beds=2, baths=2.0, sqft=900, type="condo", condition=0, tenure="rent"
        )
    with pytest.raises(ValidationError):
        models.PropertySpec(
            beds=2, baths=2.0, sqft=900, type="condo", condition=6, tenure="rent"
        )

def test_comp_baths_half_steps():
    from datetime import date
    # Valid
    models.Comp(
        id="1",
        address="123 Main St",
        distance_km=1.2,
        beds=2,
        baths=1.5,
        sqft=800,
        price=500000,
        closed_or_listed_date=date.today(),
        property_type="apartment",
        source="mls"
    )
    # Invalid
    with pytest.raises(ValidationError):
        models.Comp(
            id="2",
            address="456 Oak St",
            distance_km=1.2,
            beds=2,
            baths=1.3,
            sqft=800,
            price=500000,
            closed_or_listed_date=date.today(),
            property_type="apartment",
            source="mls"
        )
