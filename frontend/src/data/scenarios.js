export const scenarios = [
  {
    id: 'happy-path',
    name: '✅ Happy Path',
    operations: [
      { account: { 'active-card': true, 'available-limit': 100 } },
      { transaction: { merchant: 'Burger King', amount: 20, time: new Date('2019-02-13T10:00:00.000Z') } },
    ],
  },
  {
    id: 'insufficient-limit',
    name: '❌ Insufficient Limit',
    operations: [
      { account: { 'active-card': true, 'available-limit': 1000 } },
      { transaction: { merchant: 'Vivara', amount: 1250, time: new Date('2019-02-13T11:00:00.000Z') } },
      { transaction: { merchant: 'Nike', amount: 800, time: new Date('2019-02-13T11:01:01.000Z') } },
    ],
  },
  {
    id: 'high-frequency',
    name: '❌ High Frequency',
    operations: [
      { account: { 'active-card': true, 'available-limit': 100 } },
      { transaction: { merchant: 'Burger King', amount: 20, time: new Date('2019-02-13T11:00:00.000Z') } },
      { transaction: { merchant: "Habbib's", amount: 20, time: new Date('2019-02-13T11:00:01.000Z') } },
      { transaction: { merchant: "McDonald's", amount: 20, time: new Date('2019-02-13T11:01:01.000Z') } },
      { transaction: { merchant: 'Subway', amount: 20, time: new Date('2019-02-13T11:01:31.000Z') } },
      { transaction: { merchant: 'Burger King', amount: 10, time: new Date('2019-02-13T12:00:00.000Z') } },
    ],
  },
  {
    id: 'doubled-transaction',
    name: '❌ Doubled Transaction',
    operations: [
      { account: { 'active-card': true, 'available-limit': 100 } },
      { transaction: { merchant: 'Burger King', amount: 20, time: new Date('2019-02-13T11:00:00.000Z') } },
      { transaction: { merchant: 'Burger King', amount: 20, time: new Date('2019-02-13T11:00:30.000Z') } },
    ],
  },
  {
    id: 'multiple-violations',
    name: '❌ Multiple Violations',
    operations: [
      { account: { 'active-card': true, 'available-limit': 100 } },
      { transaction: { merchant: "McDonald's", amount: 10, time: new Date('2019-02-13T11:00:01.000Z') } },
      { transaction: { merchant: 'Burger King', amount: 20, time: new Date('2019-02-13T11:00:02.000Z') } },
      { transaction: { merchant: 'Burger King', amount: 5, time: new Date('2019-02-13T11:00:07.000Z') } },
      { transaction: { merchant: 'Burger King', amount: 5, time: new Date('2019-02-13T11:00:08.000Z') } },
      { transaction: { merchant: 'Burger King', amount: 150, time: new Date('2019-02-13T11:00:18.000Z') } },
      { transaction: { merchant: 'Burger King', amount: 190, time: new Date('2019-02-13T11:00:22.000Z') } },
      { transaction: { merchant: 'Burger King', amount: 15, time: new Date('2019-02-13T12:00:27.000Z') } },
    ],
  },
  {
    id: 'rejected-not-persisted',
    name: '🧪 Rejected Not Persisted',
    operations: [
      { account: { 'active-card': true, 'available-limit': 1000 } },
      { transaction: { merchant: 'Vivara', amount: 1250, time: new Date('2019-02-13T11:00:00.000Z') } },
      { transaction: { merchant: 'Samsung', amount: 2500, time: new Date('2019-02-13T11:00:01.000Z') } },
      { transaction: { merchant: 'Nike', amount: 800, time: new Date('2019-02-13T11:01:01.000Z') } },
      { transaction: { merchant: 'Uber', amount: 80, time: new Date('2019-02-13T11:01:31.000Z') } },
    ],
  },
];