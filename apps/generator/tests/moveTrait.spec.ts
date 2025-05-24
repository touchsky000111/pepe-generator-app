import { POST as generateMore } from '@/app/api/generateMore/route';
import { POST as moveTrait } from '@/app/api/moveTrait/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/moveTrait', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail validation for no id', async () => {
    const res = await moveTrait(makeRequest({}));
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('Pepe ID is required.');
  });

  test('should fail validation for no traits', async () => {
    const res = await moveTrait(makeRequest({
      pepeId: 1
    }));
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('Trait IDs is required.');
  });

  test('should fail validation for empty traits', async () => {
    const res = await moveTrait(makeRequest({
      pepeId: 1,
      traitIds: []
    }));
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('Trait IDs must contain at least 1 element(s)');
  });

  test('should throw error if pepe is not found', async () => {
    const res = await moveTrait(makeRequest({
      pepeId: 1,
      traitIds: [1]
    }));
    expect(res.status).toBe(404);
    expect((await res.json()).message).toBe('Pepe not found.');
  });
});
