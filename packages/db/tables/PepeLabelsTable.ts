import { ColumnType, Generated, sql } from 'kysely';

import { db } from '../db';

export interface PepeLabelsTable {
  id: Generated<number>;
  name: string;
  pepeId: number;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export const createPepeLabelsTable = async () => {
  await db.schema
    .createTable('pepeLabels')
    .ifNotExists()
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('name', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('pepeId', 'integer', (cb) => cb.notNull())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .addUniqueConstraint('pepeLabels_name_pepeId', ['name', 'pepeId'])
    .execute();
};
