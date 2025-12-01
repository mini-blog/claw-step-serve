import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
    @ApiProperty({ description: '状态码', example: 200 })
    code: number;

    @ApiProperty({ description: '提示信息', example: 'success' })
    message: string;

    @ApiProperty({ description: '响应数据' })
    data: T;
}
