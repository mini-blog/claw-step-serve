import { Module } from '@nestjs/common';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { UserModule } from '../user/user.module';

@Module({
    imports: [UserModule],
    controllers: [FriendshipController],
    providers: [FriendshipService],
    exports: [FriendshipService]
})
export class FriendshipModule { }
