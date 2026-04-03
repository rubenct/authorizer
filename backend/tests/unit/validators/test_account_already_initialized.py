import pytest
from datetime import datetime, timedelta
from src.core.state import Store
from src.core.models import Account
from src.validators.account_already_initialized import validate


def test_no_account_returns_empty():
    store = Store()
    result = validate(store, {"active-card": True, "available-limit": 100})
    assert result == []


def test_account_already_initialized_returns_violation():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    result = validate(store, {"active-card": True, "available-limit": 200})
    assert result == ["account-already-initialized"]