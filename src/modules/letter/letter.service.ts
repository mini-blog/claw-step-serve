import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import {
  LetterListResponseDto,
  LetterListItemDto,
  MailboxStatusResponseDto,
  LetterDetailWithTemplateDto,
} from './dto/letter-response.dto';
import { AddHistoryItemDto } from './dto/letter.dto';
import { Cron } from '@nestjs/schedule';
import { PushService } from '../notification/push/push.service';
import { NotificationType } from '../notification/dto/notification.dto';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class LetterService {
  private readonly logger = new Logger(LetterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushService: PushService,
  ) {}

  /**
   * 获取用户的来信列表
   * 优化：利用 previewText 字段，避免关联查询 Template
   */
  async getLetters(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<LetterListResponseDto> {
    const skip = (page - 1) * pageSize;

    // 排序：isRead ASC (false < true), updatedAt DESC
    const letters = await this.prisma.letter.findMany({
      where: { userId },
      include: {
        userPet: {
          include: {
            pet: {
              select: {
                name: true,
                imageUrl: true,
              }
            }
          }
        },
        template: {
          select: {
            type: true, // 只取类型，不取 content
          }
        }
      },
      orderBy: [
        { isRead: 'asc' },
        { updatedAt: 'desc' },
      ],
      skip,
      take: pageSize,
    });

    const total = await this.prisma.letter.count({ where: { userId } });

    const letterList: LetterListItemDto[] = letters.map((letter) => {
      const letterTypeStr = letter.template ? this.mapTypeIntToString(letter.template.type) : 'unknown';
      
      // 优先使用 previewText，如果没有则回退到默认值
      // 由于我们不再 include template.content，这里无法动态查找文本，
      // 依赖于 handleScheduledLetters 写入 previewText
      let previewText = (letter as any).previewText || '无标题';

      return {
        id: letter.id,
        title: previewText.substring(0, 20),
        author: letter.userPet.pet.name,
        authorAvatar: letter.userPet.pet.imageUrl,
        type: letterTypeStr,
        isRead: letter.isRead,
        isCompleted: letter.isCompleted,
        createdAt: letter.createdAt,
        updatedAt: letter.updatedAt || letter.createdAt,
      };
    });

    return {
      letters: letterList,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取信件详情及模板
   */
  async getLetterDetail(letterId: string, userId: string): Promise<LetterDetailWithTemplateDto> {
    const letter = await this.prisma.letter.findFirst({
      where: { id: letterId, userId },
      include: {
        template: true, // 这里需要完整的 template content
      }
    });

    if (!letter) {
      throw new NotFoundException('信件不存在');
    }

    const letterTypeStr = letter.template ? this.mapTypeIntToString(letter.template.type) : 'unknown';
    const history = Array.isArray(letter.content) ? letter.content : [];
    const templateContent = letter.template && Array.isArray(letter.template.content) ? letter.template.content : [];

    return {
      id: letter.id,
      type: letterTypeStr,
      isCompleted: letter.isCompleted,
      history: history,
      createdAt: letter.createdAt,
      templateContent: templateContent,
    };
  }

  /**
   * 获取信箱状态
   */
  async getMailboxStatus(userId: string): Promise<MailboxStatusResponseDto> {
    const unreadLetters = await this.prisma.letter.findMany({
      where: {
        userId,
        isRead: false,
      },
      select: {
        id: true,
      },
    });

    return {
      unreadCount: unreadLetters.length,
      unreadIds: unreadLetters.map(l => l.id),
    };
  }

  /**
   * 标记信件为已读
   */
  async markAsRead(letterId: string, userId: string): Promise<boolean> {
    const letter = await this.prisma.letter.findFirst({
      where: { id: letterId, userId },
    });

    if (!letter) {
      throw new NotFoundException('信件不存在');
    }

    if (!letter.isRead) {
      await this.prisma.letter.update({
        where: { id: letterId },
        data: { isRead: true },
      });
    }

    return true;
  }

  /**
   * 添加信件交互历史
   */
  async addHistoryItem(
    letterId: string, 
    userId: string, 
    dto: AddHistoryItemDto
  ): Promise<LetterDetailWithTemplateDto> {
    const letter = await this.prisma.letter.findFirst({
      where: { id: letterId, userId },
      include: { template: true }
    });

    if (!letter) {
      throw new NotFoundException('信件不存在');
    }

    const history: any[] = Array.isArray(letter.content) ? letter.content : [];

    // 检查是否已存在该 templateItemId
    // 如果存在，则更新（假设用户修改了选择或重新输入）
    // 如果不存在，则追加
    const existingIndex = history.findIndex((item: any) => item.templateItemId === dto.templateItemId);

    const newItem = {
      id: uuidv7(),
      templateItemId: dto.templateItemId,
      role: dto.role || (dto.text ? 'user' : 'pet'),
      text: dto.text,
      mediaType: dto.mediaType,
      mediaUrls: dto.mediaUrls,
      createdAt: new Date(),
    };

    if (existingIndex !== -1) {
      // 更新现有项，保留原ID和创建时间，但更新内容
      history[existingIndex] = {
        ...history[existingIndex],
        ...newItem,
        id: history[existingIndex].id,
        createdAt: history[existingIndex].createdAt, 
        // 注意：这里如果用户重新提交，可能希望更新 createdAt，视业务需求而定
        // 暂时保留第一次交互的时间
      };
    } else {
      history.push(newItem);
    }

    await this.prisma.letter.update({
      where: { id: letterId },
      data: {
        content: history,
        // 交互后通常意味着已读，虽然可能之前已标记
        isRead: true,
      }
    });

    // 返回更新后的详情
    return this.getLetterDetail(letterId, userId);
  }

  private mapTypeIntToString(type: number): string {
    switch (type) {
      case 1: return 'aiSong';
      case 2: return 'aiDrawing';
      case 3: return 'aiHoroscope';
      default: return 'unknown';
    }
  }

  // 定时任务：每天早上9点和晚上20点发送信件
  @Cron('0 9,20 * * *')
  async handleScheduledLetters() {
    this.logger.log('开始执行定时发送信件任务...');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 查找7天内活跃的用户
    const activeUsers = await this.prisma.user.findMany({
      where: {
        updatedAt: {
          gte: sevenDaysAgo,
      },
      },
      include: {
        userPets: {
          where: { isActive: true }, 
          take: 1,
          include: {
            pet: true
          }
        }
      }
    });

    this.logger.log(`找到 ${activeUsers.length} 个活跃用户`);

    for (const user of activeUsers) {
      if (!user.userPets || user.userPets.length === 0) continue;
      
      const userPet = user.userPets[0];
      
      // 随机选择模板
      const templateCount = await this.prisma.letterTemplate.count({
        where: { petId: userPet.petId }
      });
      
      if (templateCount === 0) continue;
      
      const skip = Math.floor(Math.random() * templateCount);
      const template = await this.prisma.letterTemplate.findFirst({
        where: { petId: userPet.petId },
        skip: skip,
      });

      if (!template) continue;

      const templateContent: any[] = Array.isArray(template.content) ? template.content : [];
      if (templateContent.length === 0) continue;

      // 取第一个模板项
      const firstTemplateItem = templateContent[0];

      // 构造初始历史记录，只记录 templateItemId
      const initialHistory = [{
        id: uuidv7(),
        templateItemId: firstTemplateItem.id, // 前端使用此ID去模板渲染
        role: 'pet',
        createdAt: new Date(),
      }];

      // 从模板项中获取文本用于预览和推送
      const previewText = firstTemplateItem.text || '点击查看信件内容';

      const letter = await this.prisma.letter.create({
        data: {
          userId: user.id,
          userPetId: userPet.id,
          templateId: template.id,
          content: initialHistory,
          previewText: previewText, // 保存预览文本
          isRead: false,
          isCompleted: false,
        }
      });
      
      this.logger.log(`已给用户 ${user.id} 发送模板 ${template.id} 的信件`);

      // 推送通知
      const petName = userPet.pet.name;
      const title = `${petName} 给你寄来了一封信`;
      const body = previewText.substring(0, 30);

      await this.pushService.pushToAccount(
        user.id,
        title,
        body,
        {
          type: NotificationType.LETTER,
          letterId: letter.id,
        }
      );
    }
    
    this.logger.log('定时发送信件任务执行完毕');
  }
}
