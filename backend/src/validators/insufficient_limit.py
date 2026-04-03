from ..core.state import Store


def validate(store: Store, transaction_data: dict) -> list[str]:
    account = store.get_account()
    if account is None:
        return []
    amount = transaction_data.get("amount", 0)
    if account.available_limit < amount:
        return ["insufficient-limit"]
    return []