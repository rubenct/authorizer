export { validate as accountAlreadyInitialized } from './accountAlreadyInitialized.js';
export { validate as accountNotInitialized } from './accountNotInitialized.js';
export { validate as cardNotActive } from './cardNotActive.js';
export { validate as insufficientLimit } from './insufficientLimit.js';
export { validate as highFrequencySmallInterval } from './highFrequencySmallInterval.js';
export { validate as doubledTransaction } from './doubledTransaction.js';

export const accountValidators = [accountAlreadyInitialized];
export const transactionValidators = [
  accountNotInitialized,
  cardNotActive,
  insufficientLimit,
  highFrequencySmallInterval,
  doubledTransaction,
];