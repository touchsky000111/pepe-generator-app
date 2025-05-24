import "dotenv/config";
import { neon } from '@neondatabase/serverless';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { LockedPepesTable, createLockedPepesTable } from './tables/LockedPepesTable';
import { PepeLabelsTable, createPepeLabelsTable } from './tables/PepeLabelsTable';
import { PepesTable, createPepesTable } from './tables/PepesTable';
import { PepeTraitsTable, createPepeTraitsTable } from './tables/PepeTraitsTable';
import { PreparedMessagesTable, createPreparedMessagesTable } from './tables/PreparedMessagesTable';
import { SpinsTable, createSpinsTable } from './tables/SpinsTable';
import { TokensTable, createTokensTable } from './tables/TokensTable';
import { TraitOptionsTable, createTraitOptionsTable } from './tables/TraitOptionsTable';
import { TraitsTable, createTraitsTable } from './tables/TraitsTable';

export * from './blob';
export * from './redis';

export interface Database {
  lockedPepes: LockedPepesTable;
  pepes: PepesTable;
  pepeLabels: PepeLabelsTable;
  pepeTraits: PepeTraitsTable;
  preparedMessages: PreparedMessagesTable;
  spins: SpinsTable;
  tokens: TokensTable;
  traits: TraitsTable;
  traitOptions: TraitOptionsTable;
}

const createDb = () => {
  console.log("POSTGRESURL");
  console.log(process.env.POSTGRES_URL);
  const dialect = new PostgresDialect({
    pool: async () => {
      const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: false
      });
      return pool;
    }
  });

  return new Kysely<Database>({
    dialect,
  });
};

export const db = createDb();

export const deinit = async () => {
  const tables = [
    'lockedPepes',
    'pepeLabels',
    'pepeTraits',
    'pepes',
    'preparedMessages',
    'spins',
    'tokens',
    'traitOptions',
    'traits',
  ];

  for (let i = 0; i < tables.length; i++) {
    await db.schema.dropTable(tables[i]).ifExists().execute();
  }
};

export const init = async () => {
  console.log("INITIAL.....DB....");
  try {
    await createLockedPepesTable();
    await createPepesTable();
    await createPepeLabelsTable();
    await createPepeTraitsTable();
    await createPreparedMessagesTable();
    await createSpinsTable();
    await createTokensTable();
    await createTraitsTable();
    await createTraitOptionsTable();
  } catch (error) {
    console.error('Initialization error:', error);
    throw error;
  }
};

export const seed = async () => { };