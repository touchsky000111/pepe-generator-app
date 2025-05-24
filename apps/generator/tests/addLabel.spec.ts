import { POST as addLabel } from '@/app/api/addLabel/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import { POST as getPepe } from '@/app/api/getPepe/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/addLabel', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should fail validation with empty object', async () => {
    const addLabelRes = await addLabel(makeRequest({}));

    expect(addLabelRes.status).toBe(422);
    expect((await addLabelRes.json()).message).toBe('Pepe ID is required.');
  });

  test('should fail validation with no pepe id', async () => {
    const addLabelRes = await addLabel(
      makeRequest({
        label: 'test',
      }),
    );

    expect(addLabelRes.status).toBe(422);
    expect((await addLabelRes.json()).message).toBe('Pepe ID is required.');
  });

  test('should fail validation with no label', async () => {
    const addLabelRes = await addLabel(
      makeRequest({
        pepeId: 1,
      }),
    );

    expect(addLabelRes.status).toBe(422);
    expect((await addLabelRes.json()).message).toBe('Label is required.');
  });

  test('should throw error is pepe is not found', async () => {
    const addLabelRes = await addLabel(
      makeRequest({
        pepeId: 1,
        label: 'test',
      }),
    );

    expect(addLabelRes.status).toBe(404);
    expect((await addLabelRes.json()).message).toBe('Pepe not found.');
  });

  test('should add label', async () => {
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

    const getPepeRes = await getPepe(
      makeRequest({
        id: 1,
      }),
    );

    expect(getPepeRes.status).toBe(200);
    expect((await getPepeRes.json()).pepe.labels).toStrictEqual(['test']);
  });

  test('should add multiple labels', async () => {
    await generateMore(
      makeRequest({
        max: 1,
      }),
    );

    await addLabel(
      makeRequest({
        pepeId: 1,
        label: 'test1',
      }),
    );

    await addLabel(
      makeRequest({
        pepeId: 1,
        label: 'test2',
      }),
    );

    const getPepeRes = await getPepe(
      makeRequest({
        id: 1,
      }),
    );

    expect(getPepeRes.status).toBe(200);
    expect((await getPepeRes.json()).pepe.labels).toStrictEqual(['test1', 'test2']);
  });

  test('should add multiple labels, ignoring duplicates', async () => {
    await generateMore(
      makeRequest({
        max: 1,
      }),
    );

    await addLabel(
      makeRequest({
        pepeId: 1,
        label: 'test',
      }),
    );

    await addLabel(
      makeRequest({
        pepeId: 1,
        label: 'test',
      }),
    );

    const getPepeRes = await getPepe(
      makeRequest({
        id: 1,
      }),
    );

    expect(getPepeRes.status).toBe(200);
    expect((await getPepeRes.json()).pepe.labels).toStrictEqual(['test']);
  });
});
