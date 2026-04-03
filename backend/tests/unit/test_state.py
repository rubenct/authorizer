import pytest
from src.core.state import Store
from src.core.models import Account, Transaction
from datetime import datetime


def test_initial_state():
    store = Store()
    assert store.get_account() is None
    assert store.get_transactions() == []


def test_set_account():
    store = Store()
    account = Account(active_card=True, available_limit=100)
    store.set_account(account)
    assert store.get_account() == account
    assert store.get_account().available_limit == 100


def test_add_transaction():
    store = Store()
    tx = Transaction("BK", 20, datetime.now())
    store.add_transaction(tx)
    assert len(store.get_transactions()) == 1
    assert store.get_transactions()[0].merchant == "BK"


def test_multiple_transactions():
    store = Store()
    store.add_transaction(Transaction("BK", 20, datetime.now()))
    store.add_transaction(Transaction("McD", 30, datetime.now()))
    assert len(store.get_transactions()) == 2