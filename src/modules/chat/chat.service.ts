import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { DoubaoService } from './services/doubao.service';
import {
  CreateSessionResponseDto,
  SendMessageResponseDto,
  ChatHistoryResponseDto,
  ChatSessionDto,
  EndSessionResponseDto,
  SessionListResponseDto,
  ChatMessageDto,
} from './dto/chat-response.dto';
import {
  CreateSessionDto,
  SendTextMessageDto,
  SendImageMessageDto,
  SendVoiceMessageDto,
} from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly doubaoService: DoubaoService,
  ) {}

  /**
   * 创建或获取聊天会话
   * 每个用户和宠物只有一个活跃会话
   */
  async createOrGetSession(
    userId: string,
    dto: CreateSessionDto,
  ): Promise<CreateSessionResponseDto> {
    // 获取 userPetId
    const userPet = await this.prisma.userPet.findUnique({
      where: {
        userId_petId: {
          userId,
          petId: dto.petId,
        },
      },
    });

    if (!userPet) {
      throw new NotFoundException('用户未拥有该宠物');
    }

    // 查找现有的活跃会话
    let session = await this.prisma.chatSession.findUnique({
      where: {
        userId_userPetId: {
          userId,
          userPetId: userPet.id,
        },
      },
    });

    // 如果存在但不活跃，重新激活
    if (session && !session.isActive) {
      session = await this.prisma.chatSession.update({
        where: { id: session.id },
        data: {
          isActive: true,
          startTime: new Date(),
          endTime: null,
          duration: 0,
        },
      });
    }

    // 如果不存在，创建新会话
    if (!session) {
      session = await this.prisma.chatSession.create({
        data: {
          userId,
          userPetId: userPet.id,
          petId: dto.petId, // 保留字段
          startTime: new Date(),
          isActive: true,
        },
      });
    }

    return {
      sessionId: session.id,
      startTime: session.startTime,
      petId: session.petId,
    };
  }

  /**
   * 发送文字消息
   */
  async sendTextMessage(
    userId: string,
    dto: SendTextMessageDto,
  ): Promise<SendMessageResponseDto> {
    // 获取或创建会话
    const session = await this.getOrCreateSession(userId, dto.petId, dto.sessionId);

    // 创建用户消息
    const userMessage = await this.prisma.chatMessage.create({
      data: {
        userId,
        userPetId: session.userPetId,
        petId: dto.petId, // 保留字段
        sessionId: session.id,
        type: 'userText',
        content: dto.content,
        mediaUrls: [],
        mediaType: 'none',
        isFromUser: true,
      },
    });

    // 更新会话统计
    await this.updateSessionStats(session.id, true);

    // 获取对话上下文（最近10条消息）
    const context = await this.getChatContext(session.id, 10);

    // 获取宠物信息
    const pet = await this.prisma.pet.findUnique({
      where: { id: dto.petId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    // 调用豆包API获取AI回复
    // 使用 personalityTags 代替 personality (因为 personality 字段已被移除)
    const personality = pet.personalityTags ? pet.personalityTags.join(',') : '';
    
    const aiResponse = await this.doubaoService.chatText(
      dto.content,
      context,
      personality,
    );

    // 创建宠物回复消息
    const petMessage = await this.prisma.chatMessage.create({
      data: {
        userId,
        userPetId: session.userPetId,
        petId: dto.petId, // 保留字段
        sessionId: session.id,
        type: 'petText',
        content: aiResponse,
        mediaUrls: [],
        mediaType: 'none',
        isFromUser: false,
      },
    });

    // 更新会话统计
    await this.updateSessionStats(session.id, false);

    return {
      userMessage: this.mapToMessageDto(userMessage),
      petMessage: this.mapToMessageDto(petMessage),
      sessionId: session.id,
    };
  }

  /**
   * 发送图片消息
   */
  async sendImageMessage(
    userId: string,
    dto: SendImageMessageDto,
  ): Promise<SendMessageResponseDto> {
    // 获取或创建会话
    const session = await this.getOrCreateSession(userId, dto.petId, dto.sessionId);

    // 创建用户消息
    const messageType = dto.content ? 'userImageText' : 'userImage';
    const userMessage = await this.prisma.chatMessage.create({
      data: {
        userId,
        userPetId: session.userPetId,
        petId: dto.petId, // 保留字段
        sessionId: session.id,
        type: messageType,
        content: dto.content || '',
        mediaUrls: [dto.imageUrl],
        mediaType: dto.content ? 'imageText' : 'image',
        isFromUser: true,
      },
    });

    // 更新会话统计
    await this.updateSessionStats(session.id, true);

    // 获取对话上下文
    const context = await this.getChatContext(session.id, 10);

    // 获取宠物信息
    const pet = await this.prisma.pet.findUnique({
      where: { id: dto.petId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    // 调用豆包API获取AI回复
    const personality = pet.personalityTags ? pet.personalityTags.join(',') : '';

    const aiResponse = await this.doubaoService.chatImage(
      dto.imageUrl,
      dto.content,
      context,
      personality,
    );

    // 创建宠物回复消息
    const petMessage = await this.prisma.chatMessage.create({
      data: {
        userId,
        userPetId: session.userPetId,
        petId: dto.petId, // 保留字段
        sessionId: session.id,
        type: 'petText',
        content: aiResponse,
        mediaUrls: [],
        mediaType: 'none',
        isFromUser: false,
      },
    });

    // 更新会话统计
    await this.updateSessionStats(session.id, false);

    return {
      userMessage: this.mapToMessageDto(userMessage),
      petMessage: this.mapToMessageDto(petMessage),
      sessionId: session.id,
    };
  }

  /**
   * 发送语音消息
   */
  async sendVoiceMessage(
    userId: string,
    dto: SendVoiceMessageDto,
  ): Promise<SendMessageResponseDto> {
    // 获取或创建会话
    const session = await this.getOrCreateSession(userId, dto.petId, dto.sessionId);

    // 语音转文字
    const textContent = await this.doubaoService.speechToText(dto.voiceUrl);

    // 创建用户消息
    const userMessage = await this.prisma.chatMessage.create({
      data: {
        userId,
        userPetId: session.userPetId,
        petId: dto.petId, // 保留字段
        sessionId: session.id,
        type: 'userVoice',
        content: textContent,
        mediaUrls: [dto.voiceUrl],
        mediaType: 'voice',
        duration: dto.duration,
        isFromUser: true,
      },
    });

    // 更新会话统计
    await this.updateSessionStats(session.id, true);

    // 获取对话上下文
    const context = await this.getChatContext(session.id, 10);

    // 获取宠物信息
    const pet = await this.prisma.pet.findUnique({
      where: { id: dto.petId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    // 调用豆包API获取AI文字回复
    const personality = pet.personalityTags ? pet.personalityTags.join(',') : '';

    const aiResponse = await this.doubaoService.chatText(
      textContent,
      context,
      personality,
    );

    // 文字转语音（可选）
    const petVoiceUrl = await this.doubaoService.textToSpeech(aiResponse);

    // 创建宠物回复消息
    const petMessage = await this.prisma.chatMessage.create({
      data: {
        userId,
        userPetId: session.userPetId,
        petId: dto.petId, // 保留字段
        sessionId: session.id,
        type: 'petText',
        content: aiResponse,
        mediaUrls: petVoiceUrl ? [petVoiceUrl] : [],
        mediaType: petVoiceUrl ? 'voice' : 'none',
        isFromUser: false,
      },
    });

    // 更新会话统计
    await this.updateSessionStats(session.id, false);

    return {
      userMessage: this.mapToMessageDto(userMessage),
      petMessage: this.mapToMessageDto(petMessage),
      sessionId: session.id,
      petVoiceUrl: petVoiceUrl || undefined,
    };
  }

  /**
   * 获取聊天历史
   */
  async getChatHistory(
    userId: string,
    petId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ChatHistoryResponseDto> {
    // 获取 userPetId
    const userPet = await this.prisma.userPet.findUnique({
      where: {
        userId_petId: {
          userId,
          petId,
        },
      },
    });

    if (!userPet) {
      return {
        messages: [],
        total: 0,
        sessionId: undefined,
      };
    }

    // 查找会话
    const session = await this.prisma.chatSession.findUnique({
      where: {
        userId_userPetId: {
          userId,
          userPetId: userPet.id,
        },
      },
    });

    if (!session) {
      return {
        messages: [],
        total: 0,
        sessionId: undefined,
      };
    }

    // 获取消息列表
    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: {
          sessionId: session.id,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.chatMessage.count({
        where: {
          sessionId: session.id,
        },
      }),
    ]);

    return {
      messages: messages.map((msg) => this.mapToMessageDto(msg)),
      total,
      sessionId: session.id,
    };
  }

  /**
   * 结束聊天会话
   */
  async endSession(
    userId: string,
    sessionId: string,
  ): Promise<EndSessionResponseDto> {
    const session = await this.prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
        isActive: true,
      },
    });

    if (!session) {
      throw new NotFoundException('会话不存在或已结束');
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        endTime,
        duration,
      },
    });

    return {
      sessionId: updated.id,
      duration: updated.duration,
      messageCount: updated.messageCount,
    };
  }

  /**
   * 获取会话列表
   */
  async getSessions(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<SessionListResponseDto> {
    const [sessions, total] = await Promise.all([
      this.prisma.chatSession.findMany({
        where: { userId },
        orderBy: {
          updatedAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.chatSession.count({
        where: { userId },
      }),
    ]);

    return {
      sessions: sessions.map((s) => this.mapToSessionDto(s)),
      total,
    };
  }

  /**
   * 获取当前活跃会话
   */
  async getCurrentSession(
    userId: string,
    petId: string,
  ): Promise<ChatSessionDto | null> {
    // 获取 userPetId
    const userPet = await this.prisma.userPet.findUnique({
      where: {
        userId_petId: {
          userId,
          petId,
        },
      },
    });

    if (!userPet) {
      return null;
    }

    const session = await this.prisma.chatSession.findUnique({
      where: {
        userId_userPetId: {
          userId,
          userPetId: userPet.id,
        },
      },
    });

    return session ? this.mapToSessionDto(session) : null;
  }

  /**
   * 私有方法：获取或创建会话
   */
  private async getOrCreateSession(
    userId: string,
    petId: string,
    sessionId?: string,
  ) {
    // 获取 userPetId
    const userPet = await this.prisma.userPet.findUnique({
      where: {
        userId_petId: {
          userId,
          petId,
        },
      },
    });

    if (!userPet) {
      throw new NotFoundException('用户未拥有该宠物');
    }

    if (sessionId) {
      const session = await this.prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
      });

      if (session) {
        return session;
      }
    }

    // 查找现有的活跃会话
    let session = await this.prisma.chatSession.findUnique({
      where: {
        userId_userPetId: {
          userId,
          userPetId: userPet.id,
        },
      },
    });

    // 如果存在但不活跃，重新激活
    if (session && !session.isActive) {
      session = await this.prisma.chatSession.update({
        where: { id: session.id },
        data: {
          isActive: true,
          startTime: new Date(),
          endTime: null,
          duration: 0,
        },
      });
    }

    // 如果不存在，创建新会话
    if (!session) {
      session = await this.prisma.chatSession.create({
        data: {
          userId,
          userPetId: userPet.id,
          petId, // 保留字段
          startTime: new Date(),
          isActive: true,
        },
      });
    }

    return session;
  }

  /**
   * 获取对话上下文（用于AI回复）
   */
  private async getChatContext(
    sessionId: string,
    limit: number = 10,
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 反转顺序，从旧到新
    messages.reverse();

    return messages.map((msg) => ({
      role: msg.isFromUser ? 'user' : 'assistant',
      content: msg.content,
    }));
  }

  /**
   * 更新会话统计
   */
  private async updateSessionStats(sessionId: string, isUserMessage: boolean) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) return;

    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        messageCount: { increment: 1 },
        userMessageCount: isUserMessage ? { increment: 1 } : undefined,
        petMessageCount: !isUserMessage ? { increment: 1 } : undefined,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 映射消息到DTO
   */
  private mapToMessageDto(msg: any): ChatMessageDto {
    return {
      id: msg.id,
      sessionId: msg.sessionId,
      type: msg.type,
      content: msg.content,
      mediaUrls: msg.mediaUrls,
      mediaType: msg.mediaType,
      duration: msg.duration,
      isFromUser: msg.isFromUser,
      createdAt: msg.createdAt,
    };
  }

  /**
   * 映射会话到DTO
   */
  private mapToSessionDto(session: any): ChatSessionDto {
    return {
      id: session.id,
      userId: session.userId,
      petId: session.petId,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      messageCount: session.messageCount,
      userMessageCount: session.userMessageCount,
      petMessageCount: session.petMessageCount,
      isActive: session.isActive,
      createdAt: session.createdAt,
    };
  }
}
