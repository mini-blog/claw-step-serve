import {
  Controller,
  Get,
  Put,
  Request,
  Param,
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
  ApiParam,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  NotificationListResponseDto,
  MarkAsReadResponseDto,
  UnreadCountResponseDto
} from './dto/notification-response.dto';
import { ApiResult, ErrorResponseDto } from '@app/core/common';

@ApiTags('notification')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    summary: '获取通知列表',
    description: '获取当前用户的通知列表，支持分页',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'page', required: false, description: '页码（从1开始）', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', example: 20 })
  @ApiResult(NotificationListResponseDto)
  @Get('list')
  async getNotifications(
    @Request() request: Request & { user: { id: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<NotificationListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    return await this.notificationService.getUserNotifications(
      request.user.id,
      pageNum,
      pageSizeNum,
    );
  }

  @ApiOperation({
    summary: '标记通知为已读',
    description: '标记指定的通知为已读状态',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: '通知ID', example: 'uuid-string' })
  @ApiResult(MarkAsReadResponseDto)
  @ApiResponse({ status: 404, description: '通知不存在', type: ErrorResponseDto })
  @Put(':id/read')
  async markAsRead(
    @Request() request: Request & { user: { id: string } },
    @Param('id') id: string,
  ): Promise<MarkAsReadResponseDto> {
    return await this.notificationService.markAsRead(request.user.id, id);
  }

  @ApiOperation({
    summary: '标记所有通知为已读',
    description: '将当前用户的所有未读通知标记为已读',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(MarkAsReadResponseDto)
  @Put('read-all')
  async markAllAsRead(
    @Request() request: Request & { user: { id: string } },
  ): Promise<MarkAsReadResponseDto> {
    return await this.notificationService.markAllAsRead(request.user.id);
  }

  @ApiOperation({
    summary: '获取未读通知数量',
    description: '获取当前用户的未读通知数量',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(UnreadCountResponseDto)
  @Get('unread-count')
  async getUnreadCount(
    @Request() request: Request & { user: { id: string } },
  ): Promise<UnreadCountResponseDto> {
    const count = await this.notificationService.getUnreadCount(request.user.id);
    return { count };
  }
}
