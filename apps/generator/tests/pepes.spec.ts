import { POST as generateMore } from '@/app/api/generateMore/route';
import { POST as pepes } from '@/app/api/pepes/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/pepes', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should return 0 pepes', async () => {
    const res = await pepes(makeRequest({}));
    expect(res.status).toBe(200);
    expect((await res.json()).pepes.length).toBe(0);
  });

  test('should return 10 pepes', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 10,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    const res = await pepes(makeRequest({}));
    expect(res.status).toBe(200);
    expect((await res.json()).pepes.length).toBe(10);
  });
});
