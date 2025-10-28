import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();
    // 获取自定义元数据，判断是否需要跳过
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]);

    if (isPublic) {
      return true;
    }

    const accessToken = request.get('Authorization');
    if (!accessToken) throw new ForbiddenException('请重新登录');
    return await super.canActivate(context) as boolean;
  }
}