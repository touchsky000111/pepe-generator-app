import { POST as traits } from '@/app/api/traits/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/traits', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail validation if no id', async () => {
    const res = await traits(makeRequest({}));
    expect(res.status).toBe(200);
    expect((await res.json()).traits.length).toBe(12);
  });
});
