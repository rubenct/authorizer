import pytest
from datetime import datetime
from src.core.state import Store
from src.core.models import Account
from src.validators.card_not_active import validate


def test_card_active_returns_empty():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    result = validate(store, {"merchant": "BK", "amount": 10, "time": datetime.now()})
    assert result == []


def test_card_not_active_returns_violation():
    store = Store()
    store.set_account(Account(active_card=False, available_limit=100))
    result = validate(store, {"merchant": "BK", "amount": 10, "time": datetime.now()})
    assert result == ["card-not-active"]


def test_no_account_returns_empty():
    store = Store()
    result = validate(store, {"merchant": "BK", "amount": 10, "time": datetime.now()})
    assert result == []