import { User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    // 让 Express.User 继承 Prisma 的 User
    // 注意：Passport 默认定义了 User 接口为空接口，这里利用接口合并
    interface User extends PrismaUser {}
    
    interface Request {
      user?: User;
    }
  }
}
