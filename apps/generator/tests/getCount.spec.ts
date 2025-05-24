import { POST as getCount } from '@/app/api/getCount/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/getCount', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should count 0', async () => {
    const res = await getCount(makeRequest({}));
    expect(res.status).toBe(200);
    expect((await res.json()).count).toBe(0);
  });

  test('should count 10', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 10,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    const res = await getCount(makeRequest({}));
    expect(res.status).toBe(200);
    expect((await res.json()).count).toBe(10);
  });
});
