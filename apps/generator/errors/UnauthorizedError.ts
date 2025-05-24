import HttpError from './HttpError';

export default class UnauthorizedError extends HttpError {
  code = 401;

  constructor(message?: string) {
    super(message || 'Unauthorized');

    this.name = 'UnauthorizedError';
  }
}
