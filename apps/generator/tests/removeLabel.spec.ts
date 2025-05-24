import { POST as addLabel } from '@/app/api/addLabel/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import { POST as getPepe } from '@/app/api/getPepe/route';
import { POST as removeLabel } from '@/app/api/removeLabel/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/removeLabel', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail validation with empty object', async () => {
    const res = await removeLabel(makeRequest({}));

    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('Pepe ID is required.');
  });

  test('should fail validation with no pepe id', async () => {
    const res = await removeLabel(
      makeRequest({
        label: 'test',
      }),
    );

    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('Pepe ID is required.');
  });

  test('should fail validation with no label', async () => {
    const res = await removeLabel(
      makeRequest({
        pepeId: 1,
      }),
    );

    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe('Label is required.');
  });

  test('should throw error is pepe is not found', async () => {
    const res = await removeLabel(
      makeRequest({
        pepeId: 1,
        label: 'test',
      }),
    );

    expect(res.status).toBe(404);
    expect((await res.json()).message).toBe('Pepe not found.');
  });

  test('should remove label', async () => {
    await generateMore(
      makeRequest({
        max: 1,
      }),
    );

    const addLabelRes = await addLabel(
      makeRequest({
        pepeId: 1,
        label: 'test',
      }),
    );

    expect(addLabelRes.status).toBe(200);

    const res = await removeLabel(
      makeRequest({
        pepeId: 1,
        label: 'test',
      }),
    );

    expect(res.status).toBe(200);

    const getPepeRes = await getPepe(
      makeRequest({
        id: 1,
      }),
    );

    expect(getPepeRes.status).toBe(200);
    expect((await getPepeRes.json()).pepe.labels.length).toBe(0);
  });

  test('should remove label, ignorning whether it exists it not', async () => {
    await generateMore(
      makeRequest({
        max: 1,
      }),
    );

    const res = await removeLabel(
      makeRequest({
        pepeId: 1,
        label: 'test',
      }),
    );

    expect(res.status).toBe(200);

    const getPepeRes = await getPepe(
      makeRequest({
        id: 1,
      }),
    );

    expect(getPepeRes.status).toBe(200);
    expect((await getPepeRes.json()).pepe.labels.length).toBe(0);
  });
});
