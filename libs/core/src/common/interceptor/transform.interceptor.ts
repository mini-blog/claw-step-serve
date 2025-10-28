import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const reqStartTime = Date.now();
    return next.handle().pipe(
      map((data) => {
        const reqEndTime = Date.now();
        const responseTime = reqEndTime - reqStartTime;
        console.log(`接口处理时间：${responseTime}ms: `, data);
        return {
          code: 200,
          message: 'success',
          data,
        };
      }),
    );
  }
}
