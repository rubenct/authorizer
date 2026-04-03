import pytest
from datetime import datetime
from src.core.state import Store
from src.core.models import Account
from src.validators.account_not_initialized import validate


def test_account_exists_returns_empty():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    result = validate(store, {"merchant": "BK", "amount": 10, "time": datetime.now()})
    assert result == []


def test_account_not_initialized_returns_violation():
    store = Store()
    result = validate(store, {"merchant": "BK", "amount": 10, "time": datetime.now()})
    assert result == ["account-not-initialized"]