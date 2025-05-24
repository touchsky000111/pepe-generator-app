import { POST as duplicateExactPepe } from '@/app/api/duplicateExactPepe/route';
import { POST as fixDuplicates } from '@/app/api/fixDuplicates/route';
import { POST as getCount } from '@/app/api/getCount/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/fixDuplicates', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fix duplicates', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 1,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    const duplicateExactPepeRes = await duplicateExactPepe(
      makeRequest({
        id: 1,
      }),
    );
    expect(duplicateExactPepeRes.status).toBe(200);

    const getCountRes1 = await getCount(
      makeRequest({
        hash: '',
        filters: [],
      }),
    );
    expect(getCountRes1.status).toBe(200);
    expect((await getCountRes1.json()).count).toBe(2);

    const res = await fixDuplicates(makeRequest({}));
    expect(res.status).toBe(200);

    const getCountRes2 = await getCount(
      makeRequest({
        hash: '',
        filters: [],
      }),
    );
    expect(getCountRes2.status).toBe(200);
    expect((await getCountRes2.json()).count).toBe(1);
  });
});
