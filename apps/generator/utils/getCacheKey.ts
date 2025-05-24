import { createHash } from 'crypto';

export default function getCacheKey(name: string, data: object) {
  const parsedInput = JSON.stringify(data);

  const hash = createHash('sha256');
  hash.update(parsedInput);
  const hex = hash.digest('hex');

  return `${name}:${hex}`;
}
