from datetime import datetime
from ..core.models import Account
from ..core.state import Store
from ..validators import account_validators


def process_account(store: Store, account_data: dict) -> tuple[Account | None, list[str]]:
    violations = []
    for validator in account_validators:
        result = validator(store, account_data)
        violations.extend(result)

    new_account = Account(
        active_card=account_data.get("active-card", False),
        available_limit=account_data.get("available-limit", 0)
    )

    if not violations:
        store.set_account(new_account)
        return store.get_account(), []

    return store.get_account(), violations