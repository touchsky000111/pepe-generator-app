import { ColumnType, Generated, sql } from 'kysely';

import { db } from '../db';

export interface PepeTraitsTable {
  id: Generated<number>;
  imageUrl?: string | null;
  index: number;
  pepeId: number;
  traitId: number;
  traitOptionId: number;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export const createPepeTraitsTable = async () => {
  await db.schema
    .createTable('pepeTraits')
    .ifNotExists()
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('imageUrl', 'varchar(255)')
    .addColumn('index', 'integer', (cb) => cb.notNull())
    .addColumn('pepeId', 'integer', (cb) => cb.notNull())
    .addColumn('traitId', 'integer', (cb) => cb.notNull())
    .addColumn('traitOptionId', 'integer', (cb) => cb.notNull())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .execute();
};
