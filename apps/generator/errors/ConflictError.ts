import HttpError from './HttpError';

export default class ConflictError extends HttpError {
  code = 409;

  constructor(message?: string) {
    super(message || 'Conflict error');

    this.name = 'ConflictError';
  }
}
