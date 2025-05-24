import { POST as checkDuplicates } from '@/app/api/checkDuplicates/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/checkDuplicates', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should check duplicates successfully', async () => {
    const res = await checkDuplicates(makeRequest({}));
    expect(res.status).toBe(200);
  });
});
