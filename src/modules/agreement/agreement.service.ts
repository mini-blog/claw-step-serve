import { Injectable } from '@nestjs/common';
import { AgreementResponseDto } from './dto/agreement-response.dto';

@Injectable()
export class AgreementService {
  /**
   * 获取用户协议内容
   * @param language 语言代码，默认'zh_CN'
   * @returns 协议内容
   */
  async getUserAgreement(language: string = 'zh_CN'): Promise<AgreementResponseDto> {
    // TODO: 可以从数据库或配置文件读取，支持多语言
    const content = this.getUserAgreementContent(language);
    
    return {
      title: '用户协议',
      content: content,
      language: language,
      version: '1.0',
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 获取隐私政策内容
   * @param language 语言代码，默认'zh_CN'
   * @returns 隐私政策内容
   */
  async getPrivacyPolicy(language: string = 'zh_CN'): Promise<AgreementResponseDto> {
    // TODO: 可以从数据库或配置文件读取，支持多语言
    const content = this.getPrivacyPolicyContent(language);
    
    return {
      title: '隐私政策',
      content: content,
      language: language,
      version: '1.0',
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 获取移动认证服务条款内容
   * @param language 语言代码，默认'zh_CN'
   * @returns 条款内容
   */
  async getMobileAuthTerms(language: string = 'zh_CN'): Promise<AgreementResponseDto> {
    // TODO: 可以从数据库或配置文件读取，支持多语言
    const content = this.getMobileAuthTermsContent(language);
    
    return {
      title: '中国移动认证服务条款',
      content: content,
      language: language,
      version: '1.0',
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 获取用户协议内容（临时实现，后续可改为从数据库读取）
   */
  private getUserAgreementContent(language: string): string {
    if (language === 'zh_CN') {
      return `
爪步 用户协议

欢迎您使用爪步 AI产品及相关服务！感谢您使用我们的产品和 / 或服务（下称 "服务"）。您使用我们的服务即表示您已同意本服务协议。请仔细阅读本服务协议内容，并充分理解并遵循相关条款。

一、服务的内容及形式

1.1 服务内容
爪步 App 是依托各种自研和开源的深度学习算法、图像算法创新推出的 "AI 音乐创作" 产品，旨在提供文本生成音乐、音乐及相关编辑、歌词编辑功能，致力于为大众进行视觉内容创作提供灵感，辅助其进行艺术创作的软件。

1.2 服务形式

您使用本服务需要下载使用我们在 iOS 和 Android 上从正版应用商店下载的 App：爪步，我们给予您一项个人的、不可转让及非排他性的许可。您仅可为访问或使用本服务的目的而使用这些产品及服务。

您可以基于一切符合所在国家或地区法律的使用用途，包括商业和非商业用途，使用我们的 AI 服务制作的音乐和歌词，在全球所有国家和地区，在遵循使用地法律的前提下使用。
      `.trim();
    }
    // TODO: 添加其他语言版本
    return this.getUserAgreementContent('zh_CN');
  }

  /**
   * 获取隐私政策内容（临时实现，后续可改为从数据库读取）
   */
  private getPrivacyPolicyContent(language: string): string {
    if (language === 'zh_CN') {
      return `
爪步 隐私条款

欢迎使用爪步App产品及相关服务！感谢您使用我们的产品和 / 或服务（以下简称 "服务"）。使用我们的服务，即表示您同意本政策。确保用户（"用户" 或 "您"）的安全和隐私是我们的首要任务，我们将尽最大努力保护您的隐私。

本隐私政策解释了当您访问我们的移动应用程序（"应用程序"）时我们如何收集、使用、披露和保护您的信息。请仔细阅读本隐私政策。如果您不同意本隐私政策的条款，请不要访问该应用程序。

我们保留随时以任何理由更改本隐私政策的权利。我们将通过更新本隐私政策的 "最后更新" 日期来提醒您任何更改。我们鼓励您定期查看本隐私政策以随时了解更新。如果您在修订后的隐私政策发布之日后继续使用该应用程序，则将被视为已了解、将受制于并被视为已接受任何修订后的隐私政策的变更。

1 信息收集
我们可能会以多种方式收集有关您使用情况的必要信息。我们可能出于不同目的收集的信息包括：
1.1 使您能够使用该应用程序并为您提供其功能。
1.2 改进我们的应用程序和质量（例如，通过进行统计分析）。
      `.trim();
    }
    // TODO: 添加其他语言版本
    return this.getPrivacyPolicyContent('zh_CN');
  }

  /**
   * 获取移动认证服务条款内容（临时实现，后续可改为从数据库读取）
   */
  private getMobileAuthTermsContent(language: string): string {
    if (language === 'zh_CN') {
      return `
中国移动认证服务条款

欢迎使用中国移动认证服务！本服务由中国移动提供，用于验证您的手机号码身份。

1. 服务说明
1.1 中国移动认证服务是一种基于运营商网络的手机号码快速验证服务。
1.2 使用本服务时，我们将获取您的手机号码用于身份验证。

2. 隐私保护
2.1 我们承诺保护您的个人信息安全，仅将您的手机号码用于身份验证目的。
2.2 未经您的同意，我们不会向第三方披露您的手机号码。

3. 使用限制
3.1 本服务仅限本人使用，不得将本服务用于任何非法用途。
3.2 禁止通过技术手段规避或破坏本服务的验证机制。
      `.trim();
    }
    // TODO: 添加其他语言版本
    return this.getMobileAuthTermsContent('zh_CN');
  }
}

