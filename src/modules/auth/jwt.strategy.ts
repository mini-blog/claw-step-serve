import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req:any) => {
          return req._protocol
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET_KEY'),
    });
    console.log('JwtStrategy', this.config.get('JWT_SECRET_KEY'));
  }

  async validate(payload: {id: string}) {
    const user = await this.userService.getUserById(payload.id);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }
}
