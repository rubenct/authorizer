import pytest
from datetime import datetime
from src.core.state import Store
from src.core.models import Account
from src.validators.insufficient_limit import validate


def test_sufficient_limit_returns_empty():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    result = validate(store, {"merchant": "BK", "amount": 50, "time": datetime.now()})
    assert result == []


def test_exact_limit_returns_empty():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    result = validate(store, {"merchant": "BK", "amount": 100, "time": datetime.now()})
    assert result == []


def test_insufficient_limit_returns_violation():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=50))
    result = validate(store, {"merchant": "BK", "amount": 100, "time": datetime.now()})
    assert result == ["insufficient-limit"]


def test_no_account_returns_empty():
    store = Store()
    result = validate(store, {"merchant": "BK", "amount": 100, "time": datetime.now()})
    assert result == []