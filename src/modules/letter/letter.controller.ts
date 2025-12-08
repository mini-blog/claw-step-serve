import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Request,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { LetterService } from './letter.service';
import {
  LetterListResponseDto,
  MailboxStatusResponseDto,
  LetterDetailWithTemplateDto 
} from './dto/letter-response.dto';
import { AddHistoryItemDto } from './dto/letter.dto';
import { ApiResult } from '@app/core/common';

@ApiTags('letter')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('letter')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  @ApiOperation({
    summary: '获取来信列表',
    description: '分页获取用户的来信列表，未读优先，按更新时间降序排序',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'page', required: false, description: '页码，默认为1', type: Number })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量，默认为30', type: Number })
  @ApiResult(LetterListResponseDto)
  @Get()
  async getLetters(
    @Request() request: Request & { user: { id: string } },
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 30,
  ): Promise<LetterListResponseDto> {
    return await this.letterService.getLetters(request.user.id, Number(page), Number(pageSize));
  }

  @ApiOperation({
    summary: '获取信箱状态',
    description: '获取未读消息总数及未读消息ID列表，用于轮询检测新消息',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(MailboxStatusResponseDto)
  @Get('status')
  async getMailboxStatus(
    @Request() request: Request & { user: { id: string } },
  ): Promise<MailboxStatusResponseDto> {
    return await this.letterService.getMailboxStatus(request.user.id);
  }

  @ApiOperation({
    summary: '获取信件详情及模板',
    description: '获取信件的交互历史和对应的完整模板内容',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(LetterDetailWithTemplateDto)
  @Get(':id')
  async getLetterDetail(
    @Request() request: Request & { user: { id: string } },
    @Param('id') id: string,
  ): Promise<LetterDetailWithTemplateDto> {
    return await this.letterService.getLetterDetail(id, request.user.id);
  }

  @ApiOperation({
    summary: '标记信件为已读',
    description: '将指定信件标记为已读',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(Boolean)
  @Put(':id/read')
  async markAsRead(
    @Request() request: Request & { user: { id: string } },
    @Param('id') id: string,
  ): Promise<boolean> {
    return await this.letterService.markAsRead(id, request.user.id);
  }

  @ApiOperation({
    summary: '更新信件交互历史',
    description: '提交新的交互步骤，支持去重（同一templateItemId会更新）',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(LetterDetailWithTemplateDto)
  @Put(':id/history')
  async addHistoryItem(
    @Request() request: Request & { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: AddHistoryItemDto,
  ): Promise<LetterDetailWithTemplateDto> {
    return await this.letterService.addHistoryItem(id, request.user.id, dto);
  }
}
