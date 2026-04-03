export class Account {
  constructor(activeCard, availableLimit) {
    this.activeCard = activeCard;
    this.availableLimit = availableLimit;
  }
}

export class Transaction {
  constructor(merchant, amount, time) {
    this.merchant = merchant;
    this.amount = amount;
    this.time = time;
  }
}

export class State {
  constructor() {
    this.account = null;
    this.transactions = [];
  }
}