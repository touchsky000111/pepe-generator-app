import { ColumnType, Generated, sql } from 'kysely';

import { db } from '../db';

export interface TraitOptionsTable {
  id: Generated<number>;
  file: string;
  name: string;
  traitId: number;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export const createTraitOptionsTable = async () => {
  await db.schema
    .createTable('traitOptions')
    .ifNotExists()
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('file', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('name', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('traitId', 'integer', (cb) => cb.notNull())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .execute();
};
