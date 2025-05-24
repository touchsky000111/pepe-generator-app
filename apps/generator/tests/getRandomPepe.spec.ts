import { POST as getRandomPepe } from '@/app/api/getRandomPepe/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import { POST as toggleApproval } from '@/app/api/toggleApproval/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/getPepe', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail to get random pepe (no approved pepes)', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 10,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    const res = await getRandomPepe(
      makeRequest({
        id: 1,
      }),
    );
    expect(res.status).toBe(409);
    expect((await res.json()).message).toBe('No available Pepes.');
  });

  test('should get random pepe', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 10,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    await toggleApproval(
      makeRequest({
        id: 5,
        isApproved: true,
      }),
    );

    const res = await getRandomPepe(
      makeRequest({
        id: 1,
      }),
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.pepe.id).toBe(5);
    expect(data.pepe.imageUrl).toBe(undefined);
    expect(data.pepe.isApproved).toBe(true);
    expect(data.pepe.labels).toStrictEqual([]);
    expect(data.pepe.metadata).toBe(undefined);
    expect(data.pepe.traits.length).toBeGreaterThan(0);
  });
});
