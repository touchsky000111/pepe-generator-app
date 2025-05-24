import { POST as updateTrait } from '@/app/api/updateTrait/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/updateTrait', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail validation if no id', async () => {
    const res = await updateTrait(makeRequest({}));
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('Pepe ID is required.');
  });
});
