import { kv } from 'db';
import { readFile } from 'fs/promises';
import path from 'path';

export const getPepeHash = async (): Promise<Record<number, string>> => {
  const pepeHashUrl = await kv.get('/pepe-hash') as string | null;
  if (!pepeHashUrl) {
    return {};
  }

  const res =
    process.env.NODE_ENV === 'test'
      ? await readFile(path.join(process.cwd(), 'tmp', pepeHashUrl), 'utf8')
      : await fetch(pepeHashUrl);
  if (!res) {
    return {};
  }

  const json = typeof res === 'string' ? JSON.parse(res) : await res.json();
  if (!json) {
    return {};
  }

  return json;
};
