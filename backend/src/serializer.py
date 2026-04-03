import json


def serialize(account: dict, violations: list[str]) -> str:
    output = {"account": account, "violations": violations}
    return json.dumps(output, separators=(",", ":"))