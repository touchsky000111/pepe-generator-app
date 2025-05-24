import { put as vercelPut } from '@vercel/blob';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

interface Opts {
  access: 'public';
}

interface Fn {
  (key: string, content: string, opts: Opts): Promise<{ url: string }>;
}

export const put: Fn =
  process.env.NODE_ENV === 'test'
    ? async (key, content, { access }) => {
      const file = path.join(process.cwd(), 'tmp', key);
      const dir = path.dirname(file);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      await writeFile(file, content);
      return {
        url: key,
      };
    }
    : (key, content, opts) => vercelPut(key, content, opts);
