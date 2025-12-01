import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { LetterService } from './letter.service';
import {
  LetterListResponseDto,
  LetterDetailResponseDto,
  MarkReadResponseDto,
  ReplyResponseDto,
  AiReplyResultResponseDto,
  UnreadCountResponseDto,
} from './dto/letter-response.dto';
import { ReplyLetterDto } from './dto/letter.dto';
import { ApiResult, ErrorResponseDto } from '@app/core/common';

@ApiTags('letter')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('letter')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  @ApiOperation({
    summary: '获取来信列表',
    description: '获取用户的来信列表，支持按类型和已读状态筛选',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'type', required: false, description: '来信类型筛选（aiDrawing/aiSong/aiHoroscope）' })
  @ApiQuery({ name: 'isRead', required: false, description: '是否已读筛选（true/false）', type: Boolean })
  @ApiResult(LetterListResponseDto)
  @Get()
  async getLetters(
    @Request() request: Request & { user: { id: string } },
    @Query('type') type?: string,
    @Query('isRead') isRead?: string,
  ): Promise<LetterListResponseDto> {
    const isReadBool = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
    return await this.letterService.getLetters(request.user.id, type, isReadBool);
  }

  @ApiOperation({
    summary: '获取来信详情',
    description: '获取来信的完整内容和回复历史',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: '来信ID' })
  @ApiResult(LetterDetailResponseDto)
  @ApiResponse({ status: 404, description: '来信不存在', type: ErrorResponseDto })
  @Get(':id')
  async getLetterById(
    @Request() request: Request & { user: { id: string } },
    @Param('id') id: string,
  ): Promise<LetterDetailResponseDto> {
    return await this.letterService.getLetterById(id, request.user.id);
  }

  @ApiOperation({
    summary: '标记已读',
    description: '标记来信为已读',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: '来信ID' })
  @ApiResult(MarkReadResponseDto)
  @ApiResponse({ status: 404, description: '来信不存在', type: ErrorResponseDto })
  @Put(':id/read')
  async markAsRead(
    @Request() request: Request & { user: { id: string } },
    @Param('id') id: string,
  ): Promise<MarkReadResponseDto> {
    return await this.letterService.markAsRead(id, request.user.id);
  }

  @ApiOperation({
    summary: '用户回复来信',
    description: '用户回复来信（试一下或保存）',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: '来信ID' })
  @ApiResult(ReplyResponseDto)
  @ApiResponse({ status: 400, description: '该来信已经交互过了', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '来信不存在', type: ErrorResponseDto })
  @Post(':id/reply')
  async replyLetter(
    @Request() request: Request & { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: ReplyLetterDto,
  ): Promise<ReplyResponseDto> {
    return await this.letterService.replyLetter(id, request.user.id, dto);
  }

  @ApiOperation({
    summary: '获取AI回复结果',
    description: '获取AI回复的生成状态和结果',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: '来信ID' })
  @ApiParam({ name: 'replyId', description: '回复ID' })
  @ApiResult(AiReplyResultResponseDto)
  @ApiResponse({ status: 404, description: '回复不存在', type: ErrorResponseDto })
  @Get(':id/reply/:replyId')
  async getAiReplyResult(
    @Request() request: Request & { user: { id: string } },
    @Param('id') id: string,
    @Param('replyId') replyId: string,
  ): Promise<AiReplyResultResponseDto> {
    return await this.letterService.getAiReplyResult(id, replyId, request.user.id);
  }

  @ApiOperation({
    summary: '获取未读数量',
    description: '获取未读来信数量',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(UnreadCountResponseDto)
  @Get('unread-count')
  async getUnreadCount(
    @Request() request: Request & { user: { id: string } },
  ): Promise<UnreadCountResponseDto> {
    return await this.letterService.getUnreadCount(request.user.id);
  }

  @ApiOperation({
    summary: '推送来信',
    description: '根据触发条件自动推送来信给用户（内部接口，可选）',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(Boolean) // Return type is Promise<any>, but typically a boolean or simple object
  @ApiResponse({ status: 200, description: '推送成功' })
  @Post('push')
  async pushLetter(
    @Request() request: Request & { user: { id: string } },
    @Body() body?: { templateId?: string },
  ): Promise<any> {
    return await this.letterService.pushLetter(request.user.id, body?.templateId);
  }
}
