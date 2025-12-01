import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { CityDto, UserCityDto } from './dto/city-response.dto';
import { ContinentDto } from './dto/continent-response.dto';

@Injectable()
export class CityService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  /**
   * 获取所有城市列表
   * @param continentId 大洲ID筛选（可选）
   * @param isUnlocked 是否解锁筛选（可选）
   * @returns 城市列表
   */
  async getAllCities(continentId?: string, isUnlocked?: boolean): Promise<CityDto[]> {
    const where: any = {};
    
    if (continentId) {
      where.continentId = continentId;
    }
    
    if (isUnlocked !== undefined) {
      where.isUnlocked = isUnlocked;
    }

    const cities = await (this.prisma as any).city.findMany({
      where,
      include: {
        continent: true
      },
      orderBy: [
        { continent: { order: 'asc' } },
        { name: 'asc' }
      ]
    });

    return cities.map((city: any) => ({
      id: city.id,
      name: city.name,
      englishName: city.englishName,
      continentId: city.continentId,
      country: city.country,
      imageUrl: city.imageUrl,
      isUnlocked: city.isUnlocked,
      unlockCondition: city.unlockCondition || undefined,
      createdAt: city.createdAt,
      updatedAt: city.updatedAt,
      continent: {
        id: city.continent.id,
        name: city.continent.name,
        englishName: city.continent.englishName,
        imageUrl: city.continent.imageUrl || '',
        order: city.continent.order,
        status: 'unlocked', // 默认为已解锁，或者是根据业务逻辑计算
        unlockedCitiesCount: 0, // 这里不计算
        totalCitiesCount: 0 // 这里不计算
      }
    }));
  }

  /**
   * 根据ID获取城市详情
   * @param id 城市ID
   * @returns 城市信息
   */
  async getCityById(id: string): Promise<CityDto> {
    const city = await (this.prisma as any).city.findUnique({
      where: { id },
      include: {
        continent: true
      }
    });

    if (!city) {
      throw new NotFoundException('城市不存在');
    }

    const cityAny = city as any;

    return {
      id: city.id,
      name: city.name,
      englishName: city.englishName,
      continentId: city.continentId,
      country: city.country,
      imageUrl: city.imageUrl,
      isUnlocked: city.isUnlocked,
      unlockCondition: city.unlockCondition || undefined,
      createdAt: city.createdAt,
      updatedAt: city.updatedAt,
      continent: {
        id: cityAny.continent.id,
        name: cityAny.continent.name,
        englishName: cityAny.continent.englishName,
        imageUrl: cityAny.continent.imageUrl || '',
        order: cityAny.continent.order,
        status: 'unlocked', // 简化处理
        unlockedCitiesCount: 0,
        totalCitiesCount: 0
      }
    };
  }

  /**
   * 获取用户当前访问的城市（最近访问的）
   * @param userId 用户ID
   * @returns 用户城市关系
   */
  async getUserCurrentCity(userId: string): Promise<UserCityDto | null> {
    const userCity = await (this.prisma as any).userCity.findFirst({
      where: { userId },
      include: {
        city: {
          include: {
            continent: true
          }
        }
      },
      orderBy: {
        lastVisitAt: 'desc'
      }
    });

    if (!userCity) {
      return null;
    }

    const cityAny = userCity.city as any;

    return {
      id: userCity.id,
      userId: userCity.userId,
      cityId: userCity.cityId,
      visitCount: userCity.visitCount,
      totalSteps: userCity.totalSteps,
      totalCalories: userCity.totalCalories,
      firstVisitAt: userCity.firstVisitAt || undefined,
      lastVisitAt: userCity.lastVisitAt || undefined,
      createdAt: userCity.createdAt,
      updatedAt: userCity.updatedAt,
      city: {
        id: userCity.city.id,
        name: userCity.city.name,
        englishName: userCity.city.englishName,
        continentId: userCity.city.continentId,
        country: userCity.city.country,
        imageUrl: userCity.city.imageUrl,
        isUnlocked: userCity.city.isUnlocked,
        unlockCondition: userCity.city.unlockCondition || undefined,
        createdAt: userCity.city.createdAt,
        updatedAt: userCity.city.updatedAt,
        continent: {
          id: cityAny.continent.id,
          name: cityAny.continent.name,
          englishName: cityAny.continent.englishName,
          imageUrl: cityAny.continent.imageUrl || '',
          order: cityAny.continent.order,
          status: 'unlocked',
          unlockedCitiesCount: 0,
          totalCitiesCount: 0
        }
      }
    };
  }

  /**
   * 获取用户的所有城市
   * @param userId 用户ID
   * @returns 用户城市列表
   */
  async getUserCities(userId: string): Promise<UserCityDto[]> {
    const userCities = await (this.prisma as any).userCity.findMany({
      where: { userId },
      include: {
        city: {
          include: {
            continent: true
          }
        }
      },
      orderBy: {
        lastVisitAt: 'desc'
      }
    });

    return userCities.map((userCity: any) => ({
      id: userCity.id,
      userId: userCity.userId,
      cityId: userCity.cityId,
      visitCount: userCity.visitCount,
      totalSteps: userCity.totalSteps,
      totalCalories: userCity.totalCalories,
      firstVisitAt: userCity.firstVisitAt || undefined,
      lastVisitAt: userCity.lastVisitAt || undefined,
      createdAt: userCity.createdAt,
      updatedAt: userCity.updatedAt,
      city: {
        id: userCity.city.id,
        name: userCity.city.name,
        englishName: userCity.city.englishName,
        continentId: userCity.city.continentId,
        country: userCity.city.country,
        imageUrl: userCity.city.imageUrl,
        isUnlocked: userCity.city.isUnlocked,
        unlockCondition: userCity.city.unlockCondition || undefined,
        createdAt: userCity.city.createdAt,
        updatedAt: userCity.city.updatedAt,
        continent: {
          id: userCity.city.continent.id,
          name: userCity.city.continent.name,
          englishName: userCity.city.continent.englishName,
          imageUrl: userCity.city.continent.imageUrl || '',
          order: userCity.city.continent.order,
          status: 'unlocked',
          unlockedCitiesCount: 0,
          totalCitiesCount: 0
        }
      }
    }));
  }

  /**
   * 解锁城市
   * @param cityId 城市ID
   * @param userId 用户ID
   * @returns 解锁结果
   */
  async unlockCity(cityId: string, userId: string): Promise<any> {
    const city = await this.prisma.city.findUnique({
      where: { id: cityId }
    });

    if (!city) {
      throw new NotFoundException('城市不存在');
    }

    // 检查是否已经解锁
    if (city.isUnlocked) {
      return {
        success: true,
        data: {
          cityId: city.id,
          unlocked: true,
          message: '城市已解锁'
        }
      };
    }

    // 获取用户信息
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查旅行券
    if (user.travelTickets <= 0) {
      throw new BadRequestException('旅行券不足');
    }

    // 使用事务：扣除旅行券并解锁城市
    const result = await this.prisma.$transaction(async (tx) => {
      // 扣除旅行券
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          travelTickets: { decrement: 1 }
        }
      });

      // 解锁城市
      await tx.city.update({
        where: { id: cityId },
        data: {
          isUnlocked: true
        }
      });

      // 创建或更新UserCity记录
      const now = new Date();
      await tx.userCity.upsert({
        where: {
          userId_cityId: {
            userId,
            cityId
          }
        },
        update: {
          lastVisitAt: now
        },
        create: {
          userId,
          cityId,
          visitCount: 0,
          totalSteps: 0,
          totalCalories: 0,
          firstVisitAt: now,
          lastVisitAt: now
        }
      });

      return {
        success: true,
        data: {
          cityId: city.id,
          unlocked: true,
          unlockedAt: now.toISOString(),
          remainingTickets: updatedUser.travelTickets
        }
      };
    });

    return result;
  }

  /**
   * 获取所有大洲及其状态
   * @returns 大洲列表
   */
  async getAllContinents(): Promise<ContinentDto[]> {
    // 获取所有大洲，并包含其下的城市信息
    // 使用 any 类型绕过 Prisma 类型检查
    const continents = await (this.prisma as any).continent.findMany({
      where: {
        isActive: true
      },
      include: {
        cities: {
          select: {
            isUnlocked: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    return continents.map((continent: any) => {
      const cities = continent.cities;
      const totalCount = cities.length;
      const unlockedCount = cities.filter((c: any) => c.isUnlocked).length;

      // 判断状态
      let status = 'locked';
      if (totalCount === 0) {
        status = 'comingSoon';
      } else if (unlockedCount > 0 && unlockedCount < totalCount) {
        status = 'locked'; // 部分解锁也视为未完全解锁，或者根据业务需求改为 'unlocked' 或 'inProgress'
        // 如果只要有一个城市解锁就算大洲解锁，可以改为 'unlocked'
        // 这里假设大洲本身没有解锁状态，只是统计下的城市
        if (unlockedCount > 0) status = 'unlocked';
      } else if (unlockedCount === totalCount && totalCount > 0) {
        status = 'unlocked';
      }

      return {
        id: continent.id,
        name: continent.name,
        englishName: continent.englishName,
        imageUrl: continent.imageUrl || '',
        order: continent.order,
        status,
        unlockedCitiesCount: unlockedCount,
        totalCitiesCount: totalCount
      };
    });
  }
}
