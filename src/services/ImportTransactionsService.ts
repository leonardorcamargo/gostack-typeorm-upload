import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository, getRepository, In } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface TransactionImport {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadCSV(filePath: string): Promise<TransactionImport[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: TransactionImport[] = [];

  parseCSV.on('data', ([title, type, value, category]) => {
    lines.push({
      title,
      type,
      value,
      category,
    });
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

interface Request {
  path: string;
}
class ImportTransactionsService {
  async execute({ path }: Request): Promise<Transaction[]> {
    const transactionsCSV = await loadCSV(path);
    const categoriesTitles = transactionsCSV
      .map(item => item.category)
      .filter((value, index, array) => array.indexOf(value) === index);

    const categoriesRepository = getRepository(Category);
    const existingCategories = await categoriesRepository.find({
      where: {
        title: In(categoriesTitles),
      },
    });

    const newCategoriesTitles = categoriesTitles.filter(title => {
      return !existingCategories.find(category => category.title === title);
    });

    const newCategories = categoriesRepository.create(
      newCategoriesTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const categories = [...newCategories, ...existingCategories];

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = transactionsRepository.create(
      transactionsCSV.map(({ title, type, value, category }) => ({
        title,
        type,
        value,
        category: categories.find(item => item.title === category),
      })),
    );

    await transactionsRepository.save(transactions);

    await fs.promises.unlink(path);
    return transactions;
  }
}

export default ImportTransactionsService;
