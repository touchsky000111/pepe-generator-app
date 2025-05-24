import { POST as checkDuplicates } from '@/app/api/checkDuplicates/route';
import { POST as duplicateExactPepe } from '@/app/api/duplicateExactPepe/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import { POST as hashes } from '@/app/api/hashes/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/hashes', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should get hashes', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 10,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    const duplicateExactPepeRes = await duplicateExactPepe(
      makeRequest({
        id: 1,
      }),
    );
    expect(duplicateExactPepeRes.status).toBe(200);

    await checkDuplicates(makeRequest({}));

    const res = await hashes(makeRequest({}));
    expect(res.status).toBe(200);
    expect((await res.json()).hashes.length).toBe(1);
  });
});
