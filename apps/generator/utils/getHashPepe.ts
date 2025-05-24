import { kv } from 'db';
import { readFile } from 'fs/promises';
import path from 'path';

export const getHashPepe = async (): Promise<Record<string, number[]>> => {
  const hashPepeUrl = await kv.get('/hash-pepe') as string | null;
  if (!hashPepeUrl) {
    return {};
  }

  const res =
    process.env.NODE_ENV === 'development'
      ? await readFile(path.join(process.cwd(), 'tmp', hashPepeUrl), 'utf8')
      : await fetch(hashPepeUrl);
  if (!res) {
    return {};
  }

  const json = typeof res === 'string' ? JSON.parse(res) : await res.json();
  if (!json) {
    return {};
  }

  return json;
};
