import { POST as checkFinalization } from '@/app/api/checkFinalization/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/checkFinalization', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should check finalization remaining', async () => {
    const res = await checkFinalization(makeRequest({}));
    expect(res.status).toBe(200);
    expect((await res.json()).remaining).toBe(10000);
  });
});
