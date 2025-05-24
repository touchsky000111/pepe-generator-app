import HttpError from './HttpError';

export default class UnprocessableContentError extends HttpError {
  code = 422;

  constructor(message?: string) {
    super(message || 'Unprocessable content');

    this.name = 'UnprocessableContentError';
  }
}
