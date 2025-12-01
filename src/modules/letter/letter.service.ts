import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import {
  LetterListResponseDto,
  LetterListItemDto,
  LetterDetailResponseDto,
  MarkReadResponseDto,
  ReplyResponseDto,
  AiReplyResultResponseDto,
  UnreadCountResponseDto,
  LetterReplyItemDto,
} from './dto/letter-response.dto';
import { ReplyLetterDto } from './dto/letter.dto';

@Injectable()
export class LetterService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取用户的来信列表
   */
  async getLetters(
    userId: string,
    type?: string,
    isRead?: boolean,
  ): Promise<LetterListResponseDto> {
    const where: {
      userId: string;
      type?: string;
      isRead?: boolean;
    } = { userId };
    
    if (type) {
      where.type = type;
    }
    
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const letters = await this.prisma.letter.findMany({
      where,
      include: {
        userPet: {
          include: {
            pet: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const unreadCount = await this.prisma.letter.count({
      where: { userId, isRead: false },
    });

    const letterList: LetterListItemDto[] = letters.map((letter) => {
      // 获取第一张图片或使用宠物头像
      const imageUrl =
        letter.mediaUrls && letter.mediaUrls.length > 0
          ? letter.mediaUrls[0]
          : letter.userPet.pet.imageUrl;

      return {
        id: letter.id,
        title: letter.title,
        author: letter.userPet.pet.name,
        date: letter.createdAt.toISOString().split('T')[0],
        isUnread: !letter.isRead,
        letterType: letter.type,
        imageUrl,
        hasInteracted: letter.hasInteracted,
      };
    });

    return {
      letters: letterList,
      unreadCount,
    };
  }

  /**
   * 获取来信详情
   */
  async getLetterById(letterId: string, userId: string): Promise<LetterDetailResponseDto> {
    const letter = await this.prisma.letter.findFirst({
      where: {
        id: letterId,
        userId,
      },
      include: {
        userPet: {
          include: {
            pet: true
          }
        },
        replies: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!letter) {
      throw new NotFoundException('来信不存在');
    }

    const replies: LetterReplyItemDto[] = letter.replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      mediaUrls: reply.mediaUrls,
      mediaType: reply.mediaType,
      isFromUser: reply.isFromUser,
      aiStatus: reply.aiStatus || undefined,
      aiResultUrl: reply.aiResultUrl || undefined,
      createdAt: reply.createdAt,
    }));

    return {
      id: letter.id,
      title: letter.title,
      author: letter.userPet.pet.name,
      type: letter.type,
      content: letter.content,
      mediaUrls: letter.mediaUrls,
      mediaType: letter.mediaType,
      isRead: letter.isRead,
      hasInteracted: letter.hasInteracted,
      createdAt: letter.createdAt,
      replies,
    };
  }

  /**
   * 标记来信为已读
   */
  async markAsRead(letterId: string, userId: string): Promise<MarkReadResponseDto> {
    const letter = await this.prisma.letter.findFirst({
      where: {
        id: letterId,
        userId,
      },
    });

    if (!letter) {
      throw new NotFoundException('来信不存在');
    }

    const updated = await this.prisma.letter.update({
      where: { id: letterId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      data: {
        id: updated.id,
        isRead: updated.isRead,
        readAt: updated.readAt!,
      },
    };
  }

  /**
   * 用户回复来信
   */
  async replyLetter(
    letterId: string,
    userId: string,
    dto: ReplyLetterDto,
  ): Promise<ReplyResponseDto> {
    const letter = await this.prisma.letter.findFirst({
      where: {
        id: letterId,
        userId,
      },
      include: {
        userPet: {
          include: {
            pet: true
          }
        },
      },
    });

    if (!letter) {
      throw new NotFoundException('来信不存在');
    }

    if (letter.hasInteracted) {
      throw new BadRequestException('该来信已经交互过了');
    }

    // 创建用户回复
    const userReply = await this.prisma.letterReply.create({
      data: {
        letterId: letter.id,
        userId,
        userPetId: letter.userPetId,
        petId: letter.petId,
        content: dto.content || (dto.action === 'try' ? '好啊，我试一下' : '谢谢，我先保存这份心意'),
        mediaUrls: dto.mediaUrls || [],
        mediaType: dto.mediaUrls && dto.mediaUrls.length > 0 ? 'singleImage' : 'none',
        isFromUser: true,
      },
    });

    let aiReply = null;
    const now = new Date();

    // 如果是"试一下"，创建AI回复（异步处理）
    if (dto.action === 'try') {
      aiReply = await this.prisma.letterReply.create({
        data: {
          letterId: letter.id,
          userId,
          userPetId: letter.userPetId,
          petId: letter.petId,
          content: this.getAiProcessingMessage(letter.type),
          mediaUrls: [],
          mediaType: 'none',
          isFromUser: false,
          aiStatus: 'processing',
        },
      });

      // 异步处理AI生成（这里可以集成实际的AI服务）
      this.processAiGeneration(letter.id, aiReply.id, letter.type, dto).catch(
        (error) => {
          console.error('AI生成失败:', error);
        },
      );
    }

    // 更新来信状态
    await this.prisma.letter.update({
      where: { id: letterId },
      data: {
        hasInteracted: true,
        interactionType: dto.action,
        interactedAt: now,
      },
    });

    const userReplyDto: LetterReplyItemDto = {
      id: userReply.id,
      content: userReply.content,
      mediaUrls: userReply.mediaUrls,
      mediaType: userReply.mediaType,
      isFromUser: userReply.isFromUser,
      aiStatus: userReply.aiStatus || undefined,
      aiResultUrl: userReply.aiResultUrl || undefined,
      createdAt: userReply.createdAt,
    };

    const aiReplyDto: LetterReplyItemDto & { estimatedTime?: number } = aiReply
      ? {
          id: aiReply.id,
          content: aiReply.content,
          mediaUrls: aiReply.mediaUrls,
          mediaType: aiReply.mediaType,
          isFromUser: aiReply.isFromUser,
          aiStatus: aiReply.aiStatus || undefined,
          aiResultUrl: aiReply.aiResultUrl || undefined,
          createdAt: aiReply.createdAt,
          estimatedTime: 30, // 预计处理时间（秒）
        }
      : {
          id: '',
          content: '',
          mediaUrls: [],
          mediaType: 'none',
          isFromUser: false,
          createdAt: now,
        };

    return {
      success: true,
      data: {
        replyId: aiReply?.id || userReply.id,
        letterId: letter.id,
        userReply: userReplyDto,
        aiReply: aiReplyDto,
      },
    };
  }

  /**
   * 获取AI回复结果
   */
  async getAiReplyResult(
    letterId: string,
    replyId: string,
    userId: string,
  ): Promise<AiReplyResultResponseDto> {
    const reply = await this.prisma.letterReply.findFirst({
      where: {
        id: replyId,
        letterId,
        userId,
        isFromUser: false,
      },
    });

    if (!reply) {
      throw new NotFoundException('回复不存在');
    }

    return {
      id: reply.id,
      aiStatus: reply.aiStatus || 'pending',
      content: reply.content,
      aiResultUrl: reply.aiResultUrl || undefined,
      mediaUrls: reply.mediaUrls,
      createdAt: reply.createdAt,
    };
  }

  /**
   * 获取未读数量
   */
  async getUnreadCount(userId: string): Promise<UnreadCountResponseDto> {
    const count = await this.prisma.letter.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { count };
  }

  /**
   * 推送来信（根据触发条件）
   * 这里是一个简化的实现，实际应该根据触发条件匹配模板
   */
  async pushLetter(userId: string, templateId?: string): Promise<any> {
    // TODO: 实现推送逻辑
    // 1. 检查触发条件
    // 2. 查找匹配的模板
    // 3. 创建来信实例
    // 4. 发送推送通知
    return { success: true, message: '推送功能待实现' };
  }

  /**
   * 获取AI处理中的消息
   */
  private getAiProcessingMessage(type: string): string {
    const messages: Record<string, string> = {
      aiDrawing: '好的，我正在为你生成绘画...',
      aiSong: '好的，我正在为你生成歌曲...',
      aiHoroscope: '好的，我正在为你生成星盘...',
    };
    return messages[type] || '好的，我正在为你处理...';
  }

  /**
   * 处理AI生成（异步）
   * 这里应该集成实际的AI服务API
   */
  private async processAiGeneration(
    letterId: string,
    replyId: string,
    type: string,
    dto: ReplyLetterDto,
  ): Promise<void> {
    // 模拟AI处理时间
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let resultUrl = '';
    let content = '';

    // 这里应该调用实际的AI服务
    // 示例：
    switch (type) {
      case 'aiDrawing':
        // resultUrl = await callAiDrawingApi(dto.mediaUrls?.[0]);
        resultUrl = 'https://example.com/ai-generated-image.jpg';
        content = '这是为你生成的绘画作品！';
        break;
      case 'aiSong':
        // resultUrl = await callAiSongApi(dto.extraData?.lyrics);
        resultUrl = 'https://example.com/ai-generated-song.mp3';
        content = '这是为你生成的歌曲！';
        break;
      case 'aiHoroscope':
        // resultUrl = await callAiHoroscopeApi(dto.extraData?.info);
        resultUrl = 'https://example.com/ai-generated-horoscope.jpg';
        content = '这是为你生成的星盘！';
        break;
    }

    // 更新回复状态
    await this.prisma.letterReply.update({
      where: { id: replyId },
      data: {
        aiStatus: 'completed',
        aiResultUrl: resultUrl,
        mediaUrls: resultUrl ? [resultUrl] : [],
        mediaType: type === 'aiSong' ? 'video' : 'singleImage',
        content,
      },
    });
  }
}
