import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';

/**
 * 可选的 JWT Guard
 * 如果请求中包含 JWT token，则验证并设置 user
 * 如果没有 token，则允许通过，但不设置 user
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    
    // 如果没有 Authorization header，允许通过但不设置 user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    // 如果有 token，尝试验证
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      // 如果验证失败，也允许通过（可选认证）
      return true;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    // 如果验证失败或没有 user，返回 undefined 而不是抛出错误
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}

