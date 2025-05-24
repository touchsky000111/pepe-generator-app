import { ColumnType, Generated, sql } from 'kysely';

import { db } from '../db';

export interface TraitsTable {
  id: Generated<number>;
  folder: string;
  name: string;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export const createTraitsTable = async () => {
  await db.schema
    .createTable('traits')
    .ifNotExists()
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('folder', 'varchar(255)', (cb) => cb.notNull().unique())
    .addColumn('name', 'varchar(255)', (cb) => cb.notNull().unique())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .execute();
};
