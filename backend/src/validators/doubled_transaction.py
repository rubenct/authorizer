from datetime import timedelta
from ..core.state import Store


def validate(store: Store, transaction_data: dict) -> list[str]:
    account = store.get_account()
    if account is None:
        return []
    
    current_time = transaction_data.get("time")
    if current_time is None:
        return []
    
    current_merchant = transaction_data.get("merchant", "")
    current_amount = transaction_data.get("amount", 0)
    
    two_minutes_ago = current_time - timedelta(minutes=2)
    
    for t in store.get_transactions():
        if t.time >= two_minutes_ago:
            if t.merchant == current_merchant and t.amount == current_amount:
                return ["doubled-transaction"]
    return []