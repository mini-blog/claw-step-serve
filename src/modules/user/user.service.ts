import { Injectable, NotFoundException } from '@nestjs/common';
import { TPostUserInfoDto, PutUserInfoDto, UpdateUserProfileDto, UserProfileResponseDto } from './dto/user.dto';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  // 7天的毫秒数
  private readonly TRAVEL_DURATION_DAYS = 7;
  private readonly TRAVEL_DURATION_MS = this.TRAVEL_DURATION_DAYS * 24 * 60 * 60 * 1000;

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
        travelTickets: true,
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
        travelTickets: true,
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
        travelTickets: true,
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
        travelTickets: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * 获取用户完整资料
   * @param userId 用户ID
   * @returns 用户资料响应
   */
  async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return await this.mapToProfileResponse(user);
  }

  /**
   * 更新用户资料（部分更新）
   * @param userId 用户ID
   * @param dto 更新数据
   * @returns 更新后的用户资料
   */
  async updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto
  ): Promise<UserProfileResponseDto> {
    const updateData: any = {};

    if (dto.nickname !== undefined) {
      updateData.nickname = dto.nickname;
    }

    if (dto.avatar !== undefined) {
      updateData.avatar = dto.avatar;
    }

    // 检查用户是否存在
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return await this.mapToProfileResponse(updatedUser);
  }

  /**
   * 映射用户数据到响应DTO
   * @param user 用户数据
   * @returns 用户资料响应DTO
   */
  private async mapToProfileResponse(user: User): Promise<UserProfileResponseDto> {
    // 生成显示ID（基于UUID的短ID，例如取前8位并转为大写）
    const displayId = user.id.substring(0, 8).toUpperCase();

    // 实时计算 isPro 状态（基于订阅）
    const isPro = await this.calculateIsProStatus(user.id);

    return {
      id: user.id,
      displayId,
      username: user.username,
      nickname: user.nickname || '用户',
      avatar: user.avatar,
      isPro,
      travelTickets: user.travelTickets,
      language: user.language,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * 计算用户 isPro 状态（基于订阅）
   * @param userId 用户ID
   * @returns 是否为Pro用户
   */
  private async calculateIsProStatus(userId: string): Promise<boolean> {
    const now = new Date();
    const activeSubscription = await this.prisma.proSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gt: now },
      },
    });

    // 如果数据库中的 isPro 状态与订阅状态不一致，更新它
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isPro: true },
    });

    const isPro = activeSubscription !== null;
    if (user && user.isPro !== isPro) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isPro },
      });
    }

    return isPro;
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
    if (user == null) {
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
    language?: string;
  }): Promise<User> {
    return await this.prisma.user.create({
      data: {
        phone: data.phone,
        openid: data.openid,
        nickname: data.nickname || `用户${data.phone.slice(-4)}`,
        avatar: data.avatar,
        language: data.language,
        isPro: false
      }
    });
  }

  /**
   * 通过邮箱和openid组合查询用户
   * @param email 邮箱
   * @param openid openid
   * @returns 用户信息
   */
  async getUserByEmailAndOpenid(email: string, openid: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        email_openid: { email, openid }
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
        travelTickets: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * 创建第三方登录用户（抖音）
   * @param data 用户数据
   * @returns 创建的用户
   */
  async createThirdPartyUser(data: {
    openid: string;
    nickname?: string;
    avatar?: string;
    language?: string;
  }): Promise<User> {
    return await this.prisma.user.create({
      data: {
        openid: data.openid,
        nickname: data.nickname || '用户',
        avatar: data.avatar,
        language: data.language || 'zh_CN',
        isPro: false
      }
    });
  }

  /**
   * 创建第三方登录用户（Apple）
   * @param data 用户数据
   * @returns 创建的用户
   */
  async createAppleUser(data: {
    openid: string;
    email?: string;
    nickname?: string;
    avatar?: string;
    language?: string;
  }): Promise<User> {
    return await this.prisma.user.create({
      data: {
        openid: data.openid,
        email: data.email,
        nickname: data.nickname || 'Apple用户',
        avatar: data.avatar,
        language: data.language || 'zh_CN',
        isPro: false
      }
    });
  }

  /**
   * 完成初始化流程
   * @param userId 用户ID
   * @param petId 选择的宠物ID
   * @param cityId 选择的城市ID
   * @param nickname 用户昵称（可选）
   * @param initialSteps 初始步数（可选，默认0）
   * @returns 初始化结果
   */
  async completeOnboarding(
    userId: string,
    petId: string,
    cityId: string,
    nickname?: string,
    initialSteps: number = 0
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 更新用户昵称（如果提供）
      if (nickname) {
        await tx.user.update({
          where: { id: userId },
          data: { nickname }
        });
      }

      // 2. 选择宠物：将所有该用户的宠物设为isActive=false，然后设置新的为active
      await tx.userPet.updateMany({
        where: { userId },
        data: { isActive: false }
      });

      // 查找是否已有此宠物记录
      const existingPet = await tx.userPet.findUnique({
        where: {
          userId_petId: { userId, petId }
        }
      });

      let userPet;
      if (existingPet) {
        // 如果存在，更新
        userPet = await tx.userPet.update({
          where: { id: existingPet.id },
          data: {
            isActive: true,
            selectedAt: new Date()
          },
          include: { pet: true }
        });
      } else {
        // 如果不存在，创建
        userPet = await tx.userPet.create({
          data: {
            userId,
            petId,
            isActive: true,
            selectedAt: new Date()
          },
          include: { pet: true }
        });
      }

      // 3. 选择/初始化城市
      const existingCity = await tx.userCity.findUnique({
        where: {
          userId_cityId: { userId, cityId }
        }
      });

      let userCity;
      if (existingCity) {
        // 已访问过，更新访问信息
        userCity = await tx.userCity.update({
          where: { id: existingCity.id },
          data: {
            visitCount: { increment: 1 },
            lastVisitAt: new Date()
          },
          include: { city: true }
        });
      } else {
        // 首次访问，创建记录
        const now = new Date();
        userCity = await tx.userCity.create({
          data: {
            userId,
            cityId,
            visitCount: 1,
            totalSteps: initialSteps,
            totalCalories: 0,
            firstVisitAt: now,
            lastVisitAt: now
          },
          include: { city: true }
        });
      }

      // 4. 记录步数到 StepRecord（如果initialSteps > 0）
      if (initialSteps > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await tx.stepRecord.upsert({
          where: {
            userId_cityId_date: {
              userId,
              cityId,
              date: today
            }
          },
          update: {
            steps: initialSteps,
            calories: Math.round(initialSteps * 0.034) // 简单估算卡路里
          },
          create: {
            userId,
            cityId,
            steps: initialSteps,
            calories: Math.round(initialSteps * 0.034),
            date: today
          }
        });
      }

      // 5. 创建旅行记录 (Travel)
      // 检查是否已有active的旅行，如果有则不创建（或者根据业务需求结束旧的开始新的）
      const activeTravel = await tx.travel.findFirst({
        where: {
          userId,
          status: 'active'
        }
      });

      if (!activeTravel) {
        await tx.travel.create({
          data: {
            userId,
            cityId,
            type: 'single', // 默认为单人旅行
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + this.TRAVEL_DURATION_MS), // 7天后结束
            totalSteps: initialSteps, // 初始步数计入本次旅行
            totalCalories: Math.round(initialSteps * 0.034),
            days: 1
          }
        });
      }

      return true;
    });
  }

  /**
   * 切换宠物
   * @param userId 用户ID
   * @param petId 新的宠物ID
   * @returns 更新后的用户宠物关系
   */
  async switchPet(userId: string, petId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 将所有该用户的宠物设为isActive=false
      await tx.userPet.updateMany({
        where: { userId },
        data: { isActive: false }
      });

      // 2. 查找是否已有此宠物记录
      const existingPet = await tx.userPet.findUnique({
        where: {
          userId_petId: { userId, petId }
        }
      });

      let userPet;
      if (existingPet) {
        // 如果存在，更新
        userPet = await tx.userPet.update({
          where: { id: existingPet.id },
          data: {
            isActive: true,
            selectedAt: new Date()
          },
          include: { pet: true }
        });
      } else {
        // 如果不存在，创建
        userPet = await tx.userPet.create({
          data: {
            userId,
            petId,
            isActive: true,
            selectedAt: new Date()
          },
          include: { pet: true }
        });
      }

      return {
        id: userPet.id,
        userId: userPet.userId,
        petId: userPet.petId,
        isActive: userPet.isActive,
        selectedAt: userPet.selectedAt,
        pet: userPet.pet
      };
    });
  }

  /**
   * 切换城市
   * @param userId 用户ID
   * @param cityId 新的城市ID
   * @returns 更新后的用户城市关系
   */
  async switchCity(userId: string, cityId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // 查找是否已有此城市记录
      const existingCity = await tx.userCity.findUnique({
        where: {
          userId_cityId: { userId, cityId }
        }
      });

      let userCity;
      if (existingCity) {
        // 已访问过，更新访问信息
        userCity = await tx.userCity.update({
          where: { id: existingCity.id },
          data: {
            visitCount: { increment: 1 },
            lastVisitAt: new Date()
          },
          include: { city: true }
        });
      } else {
        // 首次访问，创建记录
        const now = new Date();
        userCity = await tx.userCity.create({
          data: {
            userId,
            cityId,
            visitCount: 1,
            totalSteps: 0,
            totalCalories: 0,
            firstVisitAt: now,
            lastVisitAt: now
          },
          include: { city: true }
        });
      }

      return {
        id: userCity.id,
        userId: userCity.userId,
        cityId: userCity.cityId,
        visitCount: userCity.visitCount,
        totalSteps: userCity.totalSteps,
        totalCalories: userCity.totalCalories,
        firstVisitAt: userCity.firstVisitAt,
        lastVisitAt: userCity.lastVisitAt,
        city: userCity.city
      };
    });
  }

}
