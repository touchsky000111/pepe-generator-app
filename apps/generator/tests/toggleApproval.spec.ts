import { POST as toggleApproval } from '@/app/api/toggleApproval/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/toggleApproval', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail validation if no id', async () => {
    const res = await toggleApproval(makeRequest({}));
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('ID is required.');
  });
});
