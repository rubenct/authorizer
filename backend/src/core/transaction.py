from datetime import datetime
from typing import cast
from ..core.models import Transaction
from ..core.state import Store
from ..validators import transaction_validators


def process_transaction(store: Store, transaction_data: dict) -> tuple[dict, list[str]]:
    violations = []
    for validator in transaction_validators:
        result = validator(store, transaction_data)
        violations.extend(result)

    account_dict = {}
    if not violations:
        tx_time = cast(datetime, transaction_data.get("time"))
        transaction = Transaction(
            merchant=transaction_data.get("merchant", ""),
            amount=transaction_data.get("amount", 0),
            time=tx_time
        )
        store.add_transaction(transaction)
        
        account = store.get_account()
        if account:
            account.available_limit -= transaction_data.get("amount", 0)

    account = store.get_account()
    if account:
        account_dict = {
            "active-card": account.active_card,
            "available-limit": account.available_limit
        }

    return account_dict, violations