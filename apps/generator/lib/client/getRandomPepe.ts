import { GetRandomPepeRequest, GetRandomPepeResponse } from '../schemas/getRandomPepeSchema';

import { call } from './_call';

export const getRandomPepe = async (req?: GetRandomPepeRequest) => {
  return await call<GetRandomPepeResponse>('/getRandomPepe', req);
};
