from ..core.state import Store


def validate(store: Store, transaction_data: dict) -> list[str]:
    account = store.get_account()
    if account is None:
        return []
    if not account.active_card:
        return ["card-not-active"]
    return []