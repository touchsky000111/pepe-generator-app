import { POST as duplicateExactPepe } from '@/app/api/duplicateExactPepe/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/duplicateExactPepe', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should duplicate exact pepe', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 1,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    const res = await duplicateExactPepe(
      makeRequest({
        id: 1,
      }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe(2);
  });
});
