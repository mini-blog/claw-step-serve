import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { ApiResult } from '@app/core/common';
import { Express } from 'express';
import { Multer } from 'multer'; // 显式导入 Multer 类型（虽然通常在全局命名空间，但有时需要这样）

class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary', description: '要上传的文件' })
  file: any;
}

class UploadResponseDto {
  @ApiProperty({ description: '文件访问URL' })
  url: string;
}

@ApiTags('upload')
@Controller('upload')
@UseInterceptors(ClassSerializerInterceptor)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '上传文件', description: '上传文件到阿里云OSS' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件上传',
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 201,
    description: '文件上传成功',
    type: UploadResponseDto,
  })
  @ApiResult(UploadResponseDto)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          // 可以根据需要添加文件类型验证
          // new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const url = await this.uploadService.uploadFile(file);
    return { url };
  }
}

