class CodeAndMsg {
  CODE: number;
  MESSAGE: string;
}
  
export class ErrorCodeToMessage {
  static readonly ParamsError: CodeAndMsg = { 
    CODE: 400, 
    MESSAGE: '参数错误' 
  };

  static readonly Forbidden: CodeAndMsg = {
    CODE: 401,
    MESSAGE: '没有权限执行此操作',
  };

  static readonly SERVERERROR: CodeAndMsg = { 
    CODE: 500, 
    MESSAGE: '服务器出错' 
  };

  static codeToMessage(code: number): string {
    for (const key of Object.keys(this)) {
      if (this[key].CODE === code) {
        return this[key].MESSAGE;
      }
    }
    return '';
  }

  static hasCode(code: number): boolean {
    for (const key of Object.keys(this)) {
      if (this[key].CODE === code) {
        return true;
      }
    }
    return false;
  }
}
  