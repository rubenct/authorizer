from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Account:
    active_card: bool
    available_limit: int


@dataclass
class Transaction:
    merchant: str
    amount: int
    time: datetime


@dataclass
class State:
    account: Optional[Account] = None
    transactions: list[Transaction] = field(default_factory=list)