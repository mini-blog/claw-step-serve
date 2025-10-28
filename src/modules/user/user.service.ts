import { Injectable } from '@nestjs/common';
import { TPostUserInfoDto, PutUserInfoDto } from './dto/user.dto';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService
  ) { }

  /**
   * 获取用户
   * @returns 
   */
  async getUserByOpenid(openid: string): Promise<User | null> {
    console.log('getUserByOpenid', this.prisma);
    return await this.prisma.user.findFirst({
      where: { openid },
      select: {
        id: true,
        openid: true,
        email: true,
        phone: true,
        username: true,
        nickname: true,
        avatar: true,
        language: true,
        isPro: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * 通过手机号查询用户
   * @param phone 手机号
   * @returns 用户信息
   */
  async getUserByPhone(phone: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { phone },
      select: {
        id: true,
        openid: true,
        phone: true,
        email: true,
        username: true,
        nickname: true,
        avatar: true,
        language: true,
        isPro: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * 通过手机号和openid组合查询用户
   * @param phone 手机号
   * @param openid openid
   * @returns 用户信息
   */
  async getUserByPhoneAndOpenid(phone: string, openid: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { 
        phone_openid: { phone, openid }
      },
      select: {
        id: true,
        openid: true,
        phone: true,
        email: true,
        username: true,
        nickname: true,
        avatar: true,
        language: true,
        isPro: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * 获取用户通过id
   * @returns 
   */
  async getUserById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        openid: true,
        email: true,
        phone: true,
        username: true,
        nickname: true,
        avatar: true,
        language: true,
        isPro: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * qq或微信创建小程序用户
   * @returns 
   */
  async creatUser(usrInfo: TPostUserInfoDto): Promise<User> {
    return await this.prisma.user.create({
      data: usrInfo
    });
  }

  async editUser(openid: string, usrInfo: PutUserInfoDto): Promise<boolean> {
    const user = await this.prisma.user.findFirst({ 
      where: { openid }, 
      select: { id: true } 
    });
    if(user == null){
      return true;
    }
    await this.prisma.user.update({ 
      where: { id: user.id }, 
      data: usrInfo 
    });
    return true;
  }

  /**
   * 创建手机号用户
   * @param data 用户数据
   * @returns 创建的用户
   */
  async createPhoneUser(data: {
    phone: string;
    openid?: string;
    nickname?: string;
    avatar?: string;
  }): Promise<User> {
    return await this.prisma.user.create({
      data: {
        phone: data.phone,
        openid: data.openid,
        nickname: data.nickname || `用户${data.phone.slice(-4)}`,
        avatar: data.avatar,
        language: 'zh_CN',
        isPro: false
      }
    });
  }

}