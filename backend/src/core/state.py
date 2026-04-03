from typing import Optional, List
from .models import Account, Transaction


class Store:
    def __init__(self):
        self._account: Optional[Account] = None
        self._transactions: List[Transaction] = []

    def get_account(self) -> Optional[Account]:
        return self._account

    def set_account(self, account: Account) -> None:
        self._account = account

    def get_transactions(self) -> List[Transaction]:
        return self._transactions

    def add_transaction(self, transaction: Transaction) -> None:
        self._transactions.append(transaction)