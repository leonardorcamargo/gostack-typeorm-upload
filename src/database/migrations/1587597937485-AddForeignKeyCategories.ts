import {
  MigrationInterface,
  QueryRunner,
  TableForeignKey,
  TableColumn,
} from 'typeorm';

export default class AddForeignKeyCategories1587597937485
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'category_id',
        isNullable: true,
        type: 'uuid',
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'fk_transaction_category',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'fk_transaction_category');
    await queryRunner.dropColumn('transactions', 'category_id');
  }
}
