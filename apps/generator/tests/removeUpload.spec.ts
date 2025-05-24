import { POST as removeUpload } from '@/app/api/removeUpload/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/removeUpload', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail validation if no id', async () => {
    const res = await removeUpload(makeRequest({}));
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('ID is required.');
  });
});
