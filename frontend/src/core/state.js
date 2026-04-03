import { Account, Transaction } from './models.js';

export class Store {
  constructor() {
    this._account = null;
    this._transactions = [];
  }

  getAccount() {
    return this._account;
  }

  setAccount(account) {
    this._account = account;
  }

  getTransactions() {
    return this._transactions;
  }

  addTransaction(transaction) {
    this._transactions.push(transaction);
  }
}