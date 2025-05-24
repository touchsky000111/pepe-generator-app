import HttpError from '@/errors/HttpError';

export default function handleServerError(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json(
      {
        message: error.message,
      },
      {
        status: error.code,
      },
    );
  }

  console.log(error);

  return Response.json(
    {
      message: 'Internal server error',
    },
    {
      status: 500,
    },
  );
}
