from datetime import timedelta
from ..core.state import Store


def validate(store: Store, transaction_data: dict) -> list[str]:
    account = store.get_account()
    if account is None:
        return []
    
    current_time = transaction_data.get("time")
    if current_time is None:
        return []
    
    two_minutes_ago = current_time - timedelta(minutes=2)
    
    recent_transactions = [
        t for t in store.get_transactions()
        if t.time >= two_minutes_ago
    ]
    
    if len(recent_transactions) >= 3:
        return ["high-frequency-small-interval"]
    return []