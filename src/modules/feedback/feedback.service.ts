import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { CreateFeedbackDto } from './dto/feedback.dto';
import { FeedbackDto, CreateFeedbackResponseDto } from './dto/feedback-response.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建反馈
   * @param userId 用户ID
   * @param dto 创建反馈DTO
   * @returns 创建结果
   */
  async createFeedback(
    userId: string,
    dto: CreateFeedbackDto,
  ): Promise<CreateFeedbackResponseDto> {
    const feedback = await this.prisma.feedback.create({
      data: {
        userId,
        content: dto.content,
        contact: dto.contact,
        imageUrls: dto.imageUrls || [],
        status: 'pending',
      },
    });

    return {
      success: true,
      feedbackId: feedback.id,
      message: '反馈提交成功，我们会尽快处理！',
    };
  }

  /**
   * 获取用户的反馈列表
   * @param userId 用户ID
   * @param page 页码（从1开始）
   * @param pageSize 每页数量
   * @returns 反馈列表
   */
  async getUserFeedbacks(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<FeedbackDto[]> {
    const skip = (page - 1) * pageSize;

    const feedbacks = await this.prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    return feedbacks.map((f) => this.mapToDto(f));
  }

  /**
   * 将 Prisma 模型转换为 DTO
   * @param feedback Prisma 反馈模型
   * @returns 反馈DTO
   */
  private mapToDto(feedback: any): FeedbackDto {
    return {
      id: feedback.id,
      content: feedback.content,
      contact: feedback.contact || undefined,
      imageUrls: feedback.imageUrls && feedback.imageUrls.length > 0 ? feedback.imageUrls : undefined,
      status: feedback.status,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    };
  }
}

