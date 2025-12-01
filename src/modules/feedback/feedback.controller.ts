import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/feedback.dto';
import {
  CreateFeedbackResponseDto,
  FeedbackDto,
  FeedbackListResponseDto
} from './dto/feedback-response.dto';
import { ApiResult, ErrorResponseDto } from '@app/core/common';

@ApiTags('feedback')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @ApiOperation({
    summary: '提交意见反馈',
    description: '提交用户意见反馈，支持文本、联系方式和多张截图',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(CreateFeedbackResponseDto)
  @ApiResponse({ status: 400, description: '请求参数错误', type: ErrorResponseDto })
  @Post()
  async createFeedback(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: CreateFeedbackDto,
  ): Promise<CreateFeedbackResponseDto> {
    return await this.feedbackService.createFeedback(request.user.id, dto);
  }

  @ApiOperation({
    summary: '获取我的反馈列表',
    description: '获取当前用户的反馈列表，支持分页',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'page', required: false, description: '页码（从1开始）', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', example: 20 })
  @ApiResult(FeedbackListResponseDto)
  @Get('my')
  async getMyFeedbacks(
    @Request() request: Request & { user: { id: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<FeedbackListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    const feedbacks = await this.feedbackService.getUserFeedbacks(
      request.user.id,
      pageNum,
      pageSizeNum,
    );
    return { feedbacks };
  }
}
