from ..core.state import Store
from . import account, transaction


def process_operation(store: Store, operation: dict) -> tuple[dict, list[str]]:
    if "account" in operation:
        account_dict, violations = account.process_account(store, operation["account"])
        result_account = {}
        if account_dict:
            result_account = {
                "active-card": account_dict.active_card,
                "available-limit": account_dict.available_limit
            }
        return result_account, violations
    
    if "transaction" in operation:
        return transaction.process_transaction(store, operation["transaction"])
    
    return {}, []