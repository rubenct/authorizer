import pytest
from datetime import datetime, timedelta
from src.core.state import Store
from src.core.models import Account, Transaction
from src.validators.doubled_transaction import validate


def test_no_doubled_transaction_returns_empty():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    store.add_transaction(Transaction("BK", 10, datetime.now() - timedelta(seconds=30)))
    result = validate(store, {"merchant": "McD", "amount": 20, "time": datetime.now()})
    assert result == []


def test_different_amount_returns_empty():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    store.add_transaction(Transaction("BK", 10, datetime.now() - timedelta(seconds=30)))
    result = validate(store, {"merchant": "BK", "amount": 20, "time": datetime.now()})
    assert result == []


def test_different_merchant_returns_empty():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    store.add_transaction(Transaction("BK", 10, datetime.now() - timedelta(seconds=30)))
    result = validate(store, {"merchant": "McD", "amount": 10, "time": datetime.now()})
    assert result == []


def test_same_merchant_and_amount_in_window_returns_violation():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    store.add_transaction(Transaction("BK", 10, datetime.now() - timedelta(seconds=30)))
    result = validate(store, {"merchant": "BK", "amount": 10, "time": datetime.now()})
    assert result == ["doubled-transaction"]


def test_same_merchant_and_amount_outside_window_returns_empty():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    store.add_transaction(Transaction("BK", 10, datetime.now() - timedelta(minutes=3)))
    result = validate(store, {"merchant": "BK", "amount": 10, "time": datetime.now()})
    assert result == []


def test_no_account_returns_empty():
    store = Store()
    result = validate(store, {"merchant": "BK", "amount": 10, "time": datetime.now()})
    assert result == []