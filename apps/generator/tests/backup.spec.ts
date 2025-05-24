import { POST as backup } from '@/app/api/backup/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/backup', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should backup', async () => {
    const res = await backup(makeRequest({}));
    expect(res.status).toBe(200);
  });
});
