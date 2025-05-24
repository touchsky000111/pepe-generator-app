import HttpError from '@/errors/HttpError';

export default function handleServerActionError(error: unknown) {
  if (error instanceof HttpError) {
    return {
      error: error.message,
    };
  }
  return {
    error: 'Internal server error',
  };
}
