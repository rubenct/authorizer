from ..core.models import Account
from ..core.state import Store


def validate(store: Store, account_data: dict) -> list[str]:
    if store.get_account() is not None:
        return ["account-already-initialized"]
    return []