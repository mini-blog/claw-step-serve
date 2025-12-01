import { Module } from '@nestjs/common';
import { MixConfigModule } from './config/mixConfig.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TransformInterceptor, GobalValidationPipe, WsStartGateway, JwtAuthGuard, GlobalExceptionFilter } from '../common';
import { PassportModule } from '@nestjs/passport';

export * from './config/mixConfig.module';
export * from './prisma/prisma.module';
export * from './redis/redis.module';
@Module({
  imports: [
    MixConfigModule,
    PrismaModule,
    RedisModule,
    PassportModule
  ],
  providers: [
    WsStartGateway,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: GobalValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class CoreModule { };