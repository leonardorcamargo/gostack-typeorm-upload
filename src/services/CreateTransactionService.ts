import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category: categoryTitle,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (balance.total < value) {
        throw new AppError('Invalid outcome transaction with current balance');
      }
    }

    let category_id: string | undefined;

    if (categoryTitle) {
      let categoryExists = await categoriesRepository.findOne({
        where: {
          title: categoryTitle,
        },
      });

      if (!categoryExists) {
        categoryExists = categoriesRepository.create({ title: categoryTitle });
        await categoriesRepository.save(categoryExists);
      }
      category_id = categoryExists.id;
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
