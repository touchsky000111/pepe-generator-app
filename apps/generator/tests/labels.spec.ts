import { POST as addLabel } from '@/app/api/addLabel/route';
import { POST as generateMore } from '@/app/api/generateMore/route';
import { POST as labels } from '@/app/api/labels/route';
import { POST as removeLabel } from '@/app/api/removeLabel/route';
import makeRequest from '@/utils/makeRequest';
import initTestSuite from '@/utils/initTestSuite';
import deinitTestSuite from '@/utils/deinitTestSuite';

describe('/api/labels', () => {
  beforeEach(initTestSuite);
  afterAll(deinitTestSuite);

  test('should return empty labels', async () => {
    const res = await labels(makeRequest({}));
    expect(res.status).toBe(200);
    expect((await res.json()).labels).toStrictEqual([]);
  });

  test('should return added labels', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 3,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    const addLabelRes = await Promise.all([
      await addLabel(
        makeRequest({
          pepeId: 1,
          label: 'test2',
        }),
      ),
      await addLabel(
        makeRequest({
          pepeId: 2,
          label: 'test3',
        }),
      ),
      await addLabel(
        makeRequest({
          pepeId: 2,
          label: 'test1',
        }),
      ),
      await addLabel(
        makeRequest({
          pepeId: 3,
          label: 'test4',
        }),
      ),
    ]);
    addLabelRes.forEach((res) => expect(res.status).toBe(200));

    const res = await labels(makeRequest({}));
    expect(res.status).toBe(200);
    expect((await res.json()).labels).toStrictEqual(['test1', 'test2', 'test3', 'test4']);
  });

  test('should return added labels', async () => {
    const generateMoreRes = await generateMore(
      makeRequest({
        max: 3,
      }),
    );
    expect(generateMoreRes.status).toBe(200);

    const addLabelRes = await Promise.all([
      await addLabel(
        makeRequest({
          pepeId: 1,
          label: 'test2',
        }),
      ),
      await addLabel(
        makeRequest({
          pepeId: 2,
          label: 'test3',
        }),
      ),
      await addLabel(
        makeRequest({
          pepeId: 2,
          label: 'test1',
        }),
      ),
      await addLabel(
        makeRequest({
          pepeId: 3,
          label: 'test4',
        }),
      ),
    ]);
    addLabelRes.forEach((res) => expect(res.status).toBe(200));

    const removeLabelRes = await removeLabel(
      makeRequest({
        pepeId: 1,
        label: 'test2',
      }),
    );
    expect(removeLabelRes.status).toBe(200);

    const res = await labels(makeRequest({}));
    expect(res.status).toBe(200);
    expect((await res.json()).labels).toStrictEqual(['test1', 'test3', 'test4']);
  });
});
