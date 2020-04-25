import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find({});
    const { income, outcome } = transactions.reduce(
      (acc, cur) => {
        switch (cur.type) {
          case 'income':
            acc.income += Number(cur.value);
            break;

          case 'outcome':
            acc.outcome += Number(cur.value);
            break;

          default:
            break;
        }
        return acc;
      },
      {
        income: 0,
        outcome: 0,
      },
    );
    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
