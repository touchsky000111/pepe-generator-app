import { POST as getCount } from '@/app/api/getCount/route';
import { POST as deletePepe } from '@/app/api/deletePepe/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import { POST as pepes } from '@/app/api/pepes/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/deletePepe', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should delete many pepes', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 10,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    const res = await deletePepe(
      makeRequest({
        id: 2,
      }),
    );
    expect(res.status).toBe(200);

    const pepesRes = await pepes(makeRequest({}));
    expect(pepesRes.status).toBe(200);
    expect((await pepesRes.json()).pepes.length).toBe(9);

    const getCountRes = await getCount(
      makeRequest({
        hash: '',
        filters: [],
      }),
    );
    expect(getCountRes.status).toBe(200);
    expect((await getCountRes.json()).count).toBe(9);
  });
});
