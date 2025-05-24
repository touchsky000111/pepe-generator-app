import { kv } from 'db';
import getCacheKey from './getCacheKey';

export default async function setCache(name: string, request: object, response: object) {
  // const cacheKey = getCacheKey(name, request);

  // await kv.set(cacheKey, {
  //   data: response,
  //   createdAt: Date.now(),
  // });

  return response;
}
