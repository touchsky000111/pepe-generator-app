import { POST as getCount } from '@/app/api/getCount/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/generateMore', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should generate 10', async () => {
    const res = await generateMore(
      makeRequest({
        max: 10,
      }),
    );
    expect(res.status).toBe(200);

    const getCountRes = await getCount(makeRequest({}));
    expect(getCountRes.status).toBe(200);
    expect((await getCountRes.json()).count).toBe(10);
  });

  test('should generate 10 + 5', async () => {
    const res = await generateMore(
      makeRequest({
        max: 10,
      }),
    );
    expect(res.status).toBe(200);

    const getCountRes = await getCount(makeRequest({}));
    expect(getCountRes.status).toBe(200);
    expect((await getCountRes.json()).count).toBe(10);

    const res2 = await generateMore(
      makeRequest({
        max: 5,
      }),
    );
    expect(res2.status).toBe(200);

    const getCountRes2 = await getCount(makeRequest({}));
    expect(getCountRes2.status).toBe(200);
    expect((await getCountRes2.json()).count).toBe(15);
  });
});
