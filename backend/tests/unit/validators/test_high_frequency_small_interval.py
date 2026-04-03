import pytest
from datetime import datetime, timedelta
from src.core.state import Store
from src.core.models import Account, Transaction
from src.validators.high_frequency_small_interval import validate


def test_less_than_3_transactions_returns_empty():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    store.add_transaction(Transaction("BK", 10, datetime.now() - timedelta(minutes=1)))
    store.add_transaction(Transaction("McD", 10, datetime.now() - timedelta(seconds=30)))
    result = validate(store, {"merchant": "Subway", "amount": 10, "time": datetime.now()})
    assert result == []


def test_3_transactions_returns_violation():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    store.add_transaction(Transaction("BK", 10, datetime.now() - timedelta(minutes=1)))
    store.add_transaction(Transaction("McD", 10, datetime.now() - timedelta(seconds=45)))
    store.add_transaction(Transaction("Subway", 10, datetime.now() - timedelta(seconds=15)))
    result = validate(store, {"merchant": "Habbibs", "amount": 10, "time": datetime.now()})
    assert result == ["high-frequency-small-interval"]


def test_more_than_3_transactions_returns_violation():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    store.add_transaction(Transaction("BK", 10, datetime.now() - timedelta(minutes=1)))
    store.add_transaction(Transaction("McD", 10, datetime.now() - timedelta(seconds=45)))
    store.add_transaction(Transaction("Subway", 10, datetime.now() - timedelta(seconds=15)))
    store.add_transaction(Transaction("Habbibs", 10, datetime.now() - timedelta(seconds=5)))
    result = validate(store, {"merchant": "Vivara", "amount": 10, "time": datetime.now()})
    assert result == ["high-frequency-small-interval"]


def test_transactions_outside_window_returns_empty():
    store = Store()
    store.set_account(Account(active_card=True, available_limit=100))
    store.add_transaction(Transaction("BK", 10, datetime.now() - timedelta(minutes=3)))
    store.add_transaction(Transaction("McD", 10, datetime.now() - timedelta(minutes=3)))
    store.add_transaction(Transaction("Subway", 10, datetime.now() - timedelta(minutes=3)))
    result = validate(store, {"merchant": "Vivara", "amount": 10, "time": datetime.now()})
    assert result == []


def test_no_account_returns_empty():
    store = Store()
    result = validate(store, {"merchant": "BK", "amount": 10, "time": datetime.now()})
    assert result == []