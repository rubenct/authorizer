import sys
from .core.state import Store
from .core import authorizer
from . import parser, serializer


def main():
    store = Store()
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        
        operation = parser.parse_operation(line)
        
        if operation["type"] == "account":
            account_dict, violations = authorizer.process_operation(store, {"account": operation["payload"]})
        elif operation["type"] == "transaction":
            account_dict, violations = authorizer.process_operation(store, {"transaction": operation["payload"]})
        else:
            account_dict, violations = {}, []
        
        output = serializer.serialize(account_dict, violations)
        sys.stdout.write(output + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()