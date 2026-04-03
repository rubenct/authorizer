import json
from datetime import datetime


def parse_operation(line: str) -> dict:
    data = json.loads(line)
    if "account" in data:
        return {"type": "account", "payload": data["account"]}
    if "transaction" in data:
        tx_data = data["transaction"]
        tx_data["time"] = datetime.fromisoformat(tx_data["time"].replace("Z", "+00:00"))
        return {"type": "transaction", "payload": tx_data}
    return {"type": "unknown", "payload": {}}