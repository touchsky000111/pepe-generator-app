import { POST as regenerateManyPepes } from '@/app/api/regenerateManyPepes/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/regenerateManyPepes', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail validation if no ids', async () => {
    const res = await regenerateManyPepes(makeRequest({}));
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('IDs is required.');
  });

  test('should fail validation if empty ids', async () => {
    const res = await regenerateManyPepes(
      makeRequest({
        ids: [],
      }),
    );
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('IDs must contain at least 1 element(s).');
  });
});
