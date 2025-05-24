import { POST as getPepe } from '@/app/api/getPepe/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/getPepe', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail validation for no id', async () => {
    const res = await getPepe(makeRequest({}));
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('ID is required.');
  });

  test('should throw error if pepe not found', async () => {
    const res = await getPepe(
      makeRequest({
        id: 1,
      }),
    );
    expect(res.status).toBe(404);
    expect((await res.json()).message).toBe('Pepe not found.');
  });

  test('should get pepe', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 1,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    const res = await getPepe(
      makeRequest({
        id: 1,
      }),
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.pepe.id).toBe(1);
    expect(data.pepe.imageUrl).toBe(undefined);
    expect(data.pepe.isApproved).toBe(false);
    expect(data.pepe.labels).toStrictEqual([]);
    expect(data.pepe.metadata).toBe(undefined);
    expect(data.pepe.traits.length).toBeGreaterThan(0);
  });
});
