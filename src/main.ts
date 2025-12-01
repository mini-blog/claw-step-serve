import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 设置全局路由前缀
  app.setGlobalPrefix('api'); 

  // 设置swagger文档
  const config = new DocumentBuilder()
   .setTitle('Claw Step API')   
   .setDescription('Claw Step 应用后端 API 文档')
   .setVersion('1.0.0')
   .addBearerAuth(
     {
       type: 'http',
       scheme: 'bearer',
       bearerFormat: 'JWT',
       name: 'JWT',
       description: 'Enter JWT token',
       in: 'header',
     },
     'JWT-auth',
   )
   .addTag('auth', '认证相关接口')
   .addTag('user', '用户相关接口')
   .addTag('pet', '宠物相关接口')
   .addTag('city', '城市相关接口')
   .addTag('travel', '旅行相关接口')
   .addTag('chat', '聊天相关接口')
   .addTag('notification', '通知相关接口')
   .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  // 生成 OpenAPI JSON 文件（仅在开发环境）
  if (process.env.NODE_ENV === 'development') {
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(process.cwd(), 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  }

  // ws模块适配器
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(3000);
}
bootstrap();
