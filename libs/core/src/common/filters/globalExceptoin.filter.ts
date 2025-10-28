import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorCodeToMessage } from '../../constants';
import {
  CustomHttpException,
  CustomHttpExceptionResponse,
} from '../exception/customHttp.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let message: string = ErrorCodeToMessage.SERVERERROR.MESSAGE;
    let code: number = ErrorCodeToMessage.SERVERERROR.CODE;

    if (exception instanceof CustomHttpException) {
      const exceptionResponse = exception.getResponse() as CustomHttpExceptionResponse;
      code = exceptionResponse.code;
      message = exceptionResponse?.message ?? ErrorCodeToMessage.codeToMessage(code);
    } else if (exception instanceof HttpException) {
      code = exception.getStatus();
      message = exception.message
        ? exception.message
        : `${code >= 500 ? '服务器出错' : '客户端故障'}`;
    }

    response.status(HttpStatus.OK).json({
      code,
      message,
    });
  }
}
