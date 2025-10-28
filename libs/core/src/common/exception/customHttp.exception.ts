import { HttpStatus, HttpException } from '@nestjs/common';

export class CustomHttpExceptionResponse {
  code: number;
  message?: string;
}

export class CustomHttpException extends HttpException {
  constructor(response: CustomHttpExceptionResponse) {
    super(response, HttpStatus.OK);
  }
}
