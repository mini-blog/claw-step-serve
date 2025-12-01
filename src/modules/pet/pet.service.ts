import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { PetDto, UserPetDto } from './dto/pet-response.dto';
import { 
  PetProfileDto, 
  PetStatsDto, 
  AchievementDto, 
  DreamDto,
  PetCompleteProfileResponseDto 
} from './dto/pet-profile.dto';

@Injectable()
export class PetService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  /**
   * 获取所有宠物列表
   * @param userId 用户ID（可选，当 includeSelection=true 时需要）
   * @param includeSelection 是否包含选中状态
   * @returns 宠物列表
   */
  async getAllPets(
    userId?: string, 
    includeSelection: boolean = false,
  ): Promise<PetDto[]> {
    const pets = await this.prisma.pet.findMany({
      select: {
        id: true,
        name: true,
        englishName: true,
        shortDescription: true,
        longDescription: true,
        imageUrl: true,
        personalityTags: true,
        classicLines: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // 如果需要选中状态但没有提供 currentPetId，则查询
    let selectedPetId: string | undefined;
    if (includeSelection && userId) {
      const activePet = await this.getUserActivePet(userId);
      selectedPetId = activePet?.petId;
    }

    return pets.map(pet => ({
      id: pet.id,
      name: pet.name,
      englishName: pet.englishName,
      shortDescription: pet.shortDescription || undefined,
      longDescription: pet.longDescription || undefined,
      imageUrl: pet.imageUrl,
      personalityTags: pet.personalityTags || [],
      classicLines: pet.classicLines || [],
      isSelected: selectedPetId === pet.id
    }));
  }

  /**
   * 根据ID获取宠物详情
   * @param id 宠物ID
   * @returns 宠物信息
   */
  async getPetById(id: string): Promise<PetDto> {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        englishName: true,
        shortDescription: true,
        longDescription: true,
        imageUrl: true,
        personalityTags: true,
        classicLines: true,
      }
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    return {
      id: pet.id,
      name: pet.name,
      englishName: pet.englishName,
      shortDescription: pet.shortDescription || undefined,
      longDescription: pet.longDescription || undefined,
      imageUrl: pet.imageUrl,
      personalityTags: pet.personalityTags || [],
      classicLines: pet.classicLines || [],
    };
  }

  /**
   * 获取用户当前激活的宠物
   * @param userId 用户ID
   * @returns 用户宠物关系
   */
  async getUserActivePet(userId: string): Promise<UserPetDto | null> {
    const userPet = await this.prisma.userPet.findFirst({
      where: {
        userId,
        isActive: true
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            englishName: true,
            shortDescription: true,
            longDescription: true,
            imageUrl: true,
            personalityTags: true,
            classicLines: true,
          }
        }
      }
    });

    if (!userPet) {
      return null;
    }

    return {
      id: userPet.id,
      userId: userPet.userId,
      petId: userPet.petId,
      isActive: userPet.isActive,
      selectedAt: userPet.selectedAt,
      pet: {
        id: userPet.pet.id,
        name: userPet.pet.name,
        englishName: userPet.pet.englishName,
        shortDescription: userPet.pet.shortDescription || undefined,
        longDescription: userPet.pet.longDescription || undefined,
        imageUrl: userPet.pet.imageUrl,
        personalityTags: userPet.pet.personalityTags || [],
        classicLines: userPet.pet.classicLines || [],
      }
    };
  }

  /**
   * 获取用户的所有宠物
   * @param userId 用户ID
   * @returns 用户宠物列表
   */
  async getUserPets(userId: string): Promise<UserPetDto[]> {
    const userPets = await this.prisma.userPet.findMany({
      where: { userId },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            englishName: true,
            shortDescription: true,
            longDescription: true,
            imageUrl: true,
            personalityTags: true,
            classicLines: true,
          }
        }
      },
      orderBy: {
        selectedAt: 'desc'
      }
    });

    return userPets.map(userPet => ({
      id: userPet.id,
      userId: userPet.userId,
      petId: userPet.petId,
      isActive: userPet.isActive,
      selectedAt: userPet.selectedAt,
      pet: {
        id: userPet.pet.id,
        name: userPet.pet.name,
        englishName: userPet.pet.englishName,
        shortDescription: userPet.pet.shortDescription || undefined,
        longDescription: userPet.pet.longDescription || undefined,
        imageUrl: userPet.pet.imageUrl,
        personalityTags: userPet.pet.personalityTags || [],
        classicLines: userPet.pet.classicLines || [],
      }
    }));
  }

  /**
   * 获取宠物完整档案
   * @param petId 宠物ID
   * @returns 宠物完整档案信息
   */
  async getPetProfile(petId: string): Promise<PetProfileDto> {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId }
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    return {
      id: pet.id,
      name: pet.name,
      englishName: pet.englishName,
      shortDescription: pet.shortDescription || undefined,
      longDescription: pet.longDescription || undefined,
      imageUrl: pet.imageUrl,
      personalityTags: pet.personalityTags || [],
      classicLines: pet.classicLines || [],
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt
    };
  }

  /**
   * 获取宠物旅行统计（基于当前激活的宠物）
   * @param userId 用户ID
   * @param petId 宠物ID
   * @returns 旅行统计信息
   */
  async getPetStats(userId: string, petId: string): Promise<PetStatsDto> {
    // 验证用户是否拥有该宠物
    const userPet = await this.prisma.userPet.findUnique({
      where: {
        userId_petId: {
          userId,
          petId
        }
      }
    });

    if (!userPet) {
      throw new NotFoundException('用户未拥有该宠物');
    }

    // 获取已完成旅行的天数总和
    const completedTravels = await this.prisma.travel.findMany({
      where: {
        userId,
        status: 'completed'
      }
    });

    const travelDays = completedTravels.reduce((sum, travel) => sum + travel.days, 0);

    // 获取已旅行城市数量
    const visitedCities = await this.prisma.userCity.count({
      where: { userId }
    });

    // 获取累计步数（从Travel表或StepRecord表）
    const totalSteps = completedTravels.reduce((sum, travel) => sum + travel.totalSteps, 0);

    // 计算累计里程（步数 × 0.7米 / 1000，转换为公里）
    const totalDistance = Math.round((totalSteps * 0.7) / 1000 * 100) / 100;

    return {
      travelDays,
      visitedCities,
      totalSteps,
      totalDistance
    };
  }

  /**
   * 获取成就列表（包含用户进度）
   * @param userId 用户ID
   * @param petId 宠物ID
   * @returns 成就列表
   */
  async getAchievements(userId: string, petId: string): Promise<AchievementDto[]> {
    // 获取所有成就定义
    const achievements = await this.prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    // 获取用户的成就进度
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: {
        userId,
        petId
      }
    });

    // 创建成就ID到用户成就的映射
    const userAchievementMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua])
    );

    // 合并数据
    return achievements.map((achievement) => {
      const userAchievement = userAchievementMap.get(achievement.id);
      
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description || undefined,
        iconUrl: achievement.iconUrl || undefined,
        status: userAchievement?.status || 'locked',
        currentProgress: userAchievement?.currentProgress ? Number(userAchievement.currentProgress) : undefined,
        targetValue: achievement.targetValue ? Number(achievement.targetValue) : undefined,
        unlockedAt: userAchievement?.unlockedAt || undefined
      };
    });
  }

  /**
   * 获取梦想进度列表
   * @param userId 用户ID
   * @param petId 宠物ID
   * @returns 梦想列表
   */
  async getDreams(userId: string, petId: string): Promise<DreamDto[]> {
    // 获取该宠物的所有梦想定义
    const dreams = await this.prisma.dream.findMany({
      where: {
        petId,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });

    // 获取用户的梦想进度
    const userDreams = await this.prisma.userDream.findMany({
      where: {
        userId,
        petId
      }
    });

    // 创建梦想ID到用户梦想的映射
    const userDreamMap = new Map(
      userDreams.map((ud) => [ud.dreamId, ud])
    );

    // 合并数据
    return dreams.map((dream) => {
      const userDream = userDreamMap.get(dream.id);
      const currentProgress = userDream?.currentProgress || 0;
      const progressPercent = dream.targetValue > 0 ? currentProgress / dream.targetValue : 0;
      const status = progressPercent >= 1 ? 'completed' : (userDream?.status || 'in_progress');

      return {
        id: dream.id,
        name: dream.name,
        description: dream.description || undefined,
        icon: dream.icon || undefined,
        currentProgress,
        targetValue: dream.targetValue,
        progressPercent: Math.min(progressPercent, 1),
        status,
        completedAt: userDream?.completedAt || undefined
      };
    });
  }

  /**
   * 获取宠物完整档案（包含所有信息）
   * @param userId 用户ID
   * @param petId 宠物ID
   * @returns 完整档案信息
   */
  async getCompleteProfile(userId: string, petId: string): Promise<PetCompleteProfileResponseDto> {
    const [pet, stats, achievements, dreams] = await Promise.all([
      this.getPetProfile(petId),
      this.getPetStats(userId, petId),
      this.getAchievements(userId, petId),
      this.getDreams(userId, petId)
    ]);

    return {
      pet,
      stats,
      achievements: { achievements },
      dreams: { dreams }
    };
  }
}
