import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({ description: '状态码', example: 400 })
    code: number;

    @ApiProperty({ description: '错误信息', example: '请求参数错误' })
    message: string;
}
