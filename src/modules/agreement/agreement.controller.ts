import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgreementService } from './agreement.service';
import { Public } from '@app/core/common';
import { AgreementResponseDto } from './dto/agreement-response.dto';

@ApiTags('agreement')
@Controller('agreement')
export class AgreementController {
  constructor(
    private readonly agreementService: AgreementService
  ) {}

  @Public()
  @ApiOperation({ 
    summary: '获取用户协议',
    description: '获取用户协议内容'
  })
  @ApiResponse({ status: 200, description: '获取成功', type: AgreementResponseDto })
  @Get('/user')
  async getUserAgreement(@Query('language') language?: string): Promise<AgreementResponseDto> {
    return await this.agreementService.getUserAgreement(language);
  }

  @Public()
  @ApiOperation({ 
    summary: '获取隐私政策',
    description: '获取隐私政策内容'
  })
  @ApiResponse({ status: 200, description: '获取成功', type: AgreementResponseDto })
  @Get('/privacy')
  async getPrivacyPolicy(@Query('language') language?: string): Promise<AgreementResponseDto> {
    return await this.agreementService.getPrivacyPolicy(language);
  }

  @Public()
  @ApiOperation({ 
    summary: '获取移动认证服务条款',
    description: '获取中国移动认证服务条款内容'
  })
  @ApiResponse({ status: 200, description: '获取成功', type: AgreementResponseDto })
  @Get('/mobile-auth')
  async getMobileAuthTerms(@Query('language') language?: string): Promise<AgreementResponseDto> {
    return await this.agreementService.getMobileAuthTerms(language);
  }
}

