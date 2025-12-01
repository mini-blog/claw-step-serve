import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { PetService } from '../pet/pet.service';
import { CityService } from '../city/city.service';
import { TravelService } from '../travel/travel.service';
import { HomeSummaryResponseDto } from './dto/home-response.dto';

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly petService: PetService,
    private readonly cityService: CityService,
    private readonly travelService: TravelService
  ) {}

  /**
   * 获取主页聚合信息
   * @param userId 用户ID
   * @returns 主页数据
   */
  async getHomeSummary(userId: string): Promise<HomeSummaryResponseDto> {
    // 并行获取所有需要的数据
    const [user, currentPet, currentCity, todaySteps, companions] = await Promise.all([
      // 获取用户信息
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nickname: true,
          avatar: true
        }
      }),

      // 获取当前激活的宠物
      this.petService.getUserActivePet(userId),

      // 获取当前城市
      this.cityService.getUserCurrentCity(userId),

      // 获取今日步数
      this.travelService.getTodaySteps(userId),

      // 获取旅伴列表
      this.travelService.getCurrentCompanions(userId)
    ]);

    return {
      currentCity: currentCity ? {
        id: currentCity.city.id,
        name: currentCity.city.name,
        englishName: currentCity.city.englishName
      } : undefined,

      currentPet: currentPet ? {
        id: currentPet.pet.id,
        name: currentPet.pet.name
      } : undefined,

      todaySteps: {
        steps: todaySteps.steps,
        goal: todaySteps.goal,
        calories: todaySteps.calories
      },

      companions: companions.map(companion => ({
        id: companion.id,
        nickname: companion.nickname,
        avatar: companion.avatar
      })),

      user: {
        id: user?.id || '',
        nickname: user?.nickname || '',
        avatar: user?.avatar || ''
      }
    };
  }
}

