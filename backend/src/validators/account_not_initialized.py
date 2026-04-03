from ..core.state import Store


def validate(store: Store, transaction_data: dict) -> list[str]:
    if store.get_account() is None:
        return ["account-not-initialized"]
    return []