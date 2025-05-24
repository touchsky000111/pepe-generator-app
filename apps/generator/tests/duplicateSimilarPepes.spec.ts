import { POST as duplicateSimilarPepes } from '@/app/api/duplicateSimilarPepes/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import { POST as listPepes } from '@/app/api/pepes/route';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';
import makeRequest from '@/utils/makeRequest';

describe('/api/duplicateSimilarPepes', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail validation with no id nor traitIds', async () => {
    const res = await duplicateSimilarPepes(makeRequest({}));

    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('ID is required.');
  });

  test('should fail validation with id less than 1', async () => {
    const res = await duplicateSimilarPepes(
      makeRequest({
        id: 0,
        traitId: 1,
      }),
    );

    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('ID must be greater than or equal to 1.');
  });

  test('should fail validation with traitIds less than 1', async () => {
    const res = await duplicateSimilarPepes(
      makeRequest({
        id: 1,
        traitId: 0,
      }),
    );

    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('Trait ID must be greater than or equal to 1.');
  });

  test('should throw error for missing pepe', async () => {
    const res = await duplicateSimilarPepes(
      makeRequest({
        id: 1,
        traitId: 1,
      }),
    );

    expect(res.status).toBe(404);
    expect((await res.json()).message).toBe('Pepe not found.');
  });

  test('should generate similar pepes', async () => {
    await generateMore(
      makeRequest({
        max: 1,
      }),
    );

    const duplicateSimilarPepesRes = await duplicateSimilarPepes(
      makeRequest({
        id: 1,
        traitId: 2,
      }),
    );
    expect(duplicateSimilarPepesRes.status).toBe(200);

    const listPepesRes = await listPepes(makeRequest({}));

    expect(listPepesRes.status).toBe(200);
    expect((await listPepesRes.json()).pepes.length).toBe(3);
  });
});
