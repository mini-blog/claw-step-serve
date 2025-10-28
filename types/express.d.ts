import { User } from '@prisma/client';

declare global {
  namespace Express {
    // 扩展 User 接口
    interface User extends User {}
    
    // 扩展 Request 接口
    interface Request {
      user: User;
    }
  }
}

export {};