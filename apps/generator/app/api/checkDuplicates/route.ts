import { checkDuplicates } from '@/utils/checkDuplicates';

export const maxDuration = 60;

export async function POST(_: Request) {
  await checkDuplicates();

  return Response.json({});
}
