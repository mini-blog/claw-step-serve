import { Body, ClassSerializerInterceptor, Controller, Get, Post, Put, Request, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PutUserInfoDto, } from './dto/user.dto';

@ApiTags('用户')
@UseInterceptors(ClassSerializerInterceptor)
@Controller("/user")
export class UserController {
	constructor(private readonly userService: UserService) { }

	@ApiOperation({ summary: '获取用户' })
	@Get()
	async getUser(@Request() request: Request & { user: { openid: string } }) {
		return await this.userService.getUserByOpenid(request.user.openid);
	}

	@ApiOperation({ summary: '创建用户' })
	@Post()
	async postUser(@Request() request: Request & { user: { openid: string } }, @Body() putUserInfoDto: PutUserInfoDto) {
		return await this.userService.editUser(request.user.openid, putUserInfoDto);
	}

	@ApiOperation({ summary: '修改用户' })
	@Put()
	async editUser(@Request() request: Request & { user: { openid: string } }, @Body() putUserInfoDto: PutUserInfoDto) {
		return await this.userService.editUser(request.user.openid, putUserInfoDto);
	}
}
