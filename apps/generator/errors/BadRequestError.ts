import HttpError from './HttpError';

export default class BadRequestError extends HttpError {
  code = 400;

  constructor(message?: string) {
    super(message || 'Bad request');

    this.name = 'BadRequestError';
  }
}
