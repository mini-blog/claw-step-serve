import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core/modules';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    CoreModule,
    // 业务模块
    AuthModule,
    UserModule,
  ],
})
export class AppModule { }
