import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({secret: config.get('JWT_SECRET_KEY')}),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SmsService],
  exports: [AuthService]
})
export class AuthModule {}
