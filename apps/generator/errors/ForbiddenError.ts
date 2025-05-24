import HttpError from './HttpError';

export default class ForbiddenError extends HttpError {
  code = 403;

  constructor(message?: string) {
    super(message || 'Forbidden');

    this.name = 'ForbiddenError';
  }
}
