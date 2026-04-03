import pytest
import json
from io import StringIO
from src.core.state import Store
from src.core import authorizer
from src import parser, serializer


def test_happy_path():
    store = Store()
    
    op1 = parser.parse_operation('{"account": {"active-card": true, "available-limit": 100}}')
    account_dict, violations = authorizer.process_operation(store, {"account": op1["payload"]})
    assert account_dict == {"active-card": True, "available-limit": 100}
    assert violations == []
    
    op2 = parser.parse_operation('{"transaction": {"merchant": "Burger King", "amount": 20, "time": "2019-02-13T10:00:00.000Z"}}')
    account_dict, violations = authorizer.process_operation(store, {"transaction": op2["payload"]})
    assert account_dict == {"active-card": True, "available-limit": 80}
    assert violations == []


def test_account_already_initialized():
    store = Store()
    
    op1 = parser.parse_operation('{"account": {"active-card": true, "available-limit": 100}}')
    authorizer.process_operation(store, {"account": op1["payload"]})
    
    op2 = parser.parse_operation('{"account": {"active-card": true, "available-limit": 200}}')
    account_dict, violations = authorizer.process_operation(store, {"account": op2["payload"]})
    assert "account-already-initialized" in violations


def test_account_not_initialized():
    store = Store()
    
    op = parser.parse_operation('{"transaction": {"merchant": "BK", "amount": 20, "time": "2019-02-13T10:00:00.000Z"}}')
    account_dict, violations = authorizer.process_operation(store, {"transaction": op["payload"]})
    assert account_dict == {}
    assert "account-not-initialized" in violations


def test_insufficient_limit():
    store = Store()
    
    op1 = parser.parse_operation('{"account": {"active-card": true, "available-limit": 100}}')
    authorizer.process_operation(store, {"account": op1["payload"]})
    
    op2 = parser.parse_operation('{"transaction": {"merchant": "Vivara", "amount": 150, "time": "2019-02-13T10:00:00.000Z"}}')
    account_dict, violations = authorizer.process_operation(store, {"transaction": op2["payload"]})
    assert "insufficient-limit" in violations
    assert account_dict["available-limit"] == 100


def test_card_not_active():
    store = Store()
    
    op1 = parser.parse_operation('{"account": {"active-card": false, "available-limit": 100}}')
    authorizer.process_operation(store, {"account": op1["payload"]})
    
    op2 = parser.parse_operation('{"transaction": {"merchant": "BK", "amount": 20, "time": "2019-02-13T10:00:00.000Z"}}')
    account_dict, violations = authorizer.process_operation(store, {"transaction": op2["payload"]})
    assert "card-not-active" in violations


def test_high_frequency_small_interval():
    store = Store()
    
    op1 = parser.parse_operation('{"account": {"active-card": true, "available-limit": 100}}')
    authorizer.process_operation(store, {"account": op1["payload"]})
    
    for i in range(4):
        op = parser.parse_operation(f'{{"transaction": {{"merchant": "M{i}", "amount": 10, "time": "2019-02-13T10:00:0{i}.000Z"}}}}')
        account_dict, violations = authorizer.process_operation(store, {"transaction": op["payload"]})
    
    assert "high-frequency-small-interval" in violations


def test_doubled_transaction():
    store = Store()
    
    op1 = parser.parse_operation('{"account": {"active-card": true, "available-limit": 100}}')
    authorizer.process_operation(store, {"account": op1["payload"]})
    
    op2 = parser.parse_operation('{"transaction": {"merchant": "BK", "amount": 20, "time": "2019-02-13T10:00:00.000Z"}}')
    authorizer.process_operation(store, {"transaction": op2["payload"]})
    
    op3 = parser.parse_operation('{"transaction": {"merchant": "BK", "amount": 20, "time": "2019-02-13T10:00:30.000Z"}}')
    account_dict, violations = authorizer.process_operation(store, {"transaction": op3["payload"]})
    assert "doubled-transaction" in violations


def test_multiple_violations():
    store = Store()
    
    op1 = parser.parse_operation('{"account": {"active-card": true, "available-limit": 100}}')
    authorizer.process_operation(store, {"account": op1["payload"]})
    
    for i in range(3):
        op = parser.parse_operation(f'{{"transaction": {{"merchant": "M{i}", "amount": 10, "time": "2019-02-13T10:00:0{i}.000Z"}}}}')
        authorizer.process_operation(store, {"transaction": op["payload"]})
    
    op4 = parser.parse_operation('{"transaction": {"merchant": "M0", "amount": 10, "time": "2019-02-13T10:00:30.000Z"}}')
    account_dict, violations = authorizer.process_operation(store, {"transaction": op4["payload"]})
    assert "high-frequency-small-interval" in violations
    assert "doubled-transaction" in violations


def test_rejected_transactions_not_persisted():
    store = Store()
    
    op1 = parser.parse_operation('{"account": {"active-card": true, "available-limit": 100}}')
    authorizer.process_operation(store, {"account": op1["payload"]})
    
    op2 = parser.parse_operation('{"transaction": {"merchant": "Vivara", "amount": 150, "time": "2019-02-13T11:00:00.000Z"}}')
    authorizer.process_operation(store, {"transaction": op2["payload"]})
    
    op3 = parser.parse_operation('{"transaction": {"merchant": "Nike", "amount": 80, "time": "2019-02-13T11:01:00.000Z"}}')
    account_dict, violations = authorizer.process_operation(store, {"transaction": op3["payload"]})
    assert violations == []
    assert account_dict["available-limit"] == 20