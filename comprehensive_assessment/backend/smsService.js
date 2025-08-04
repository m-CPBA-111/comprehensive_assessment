const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');

class SMSService {
  constructor() {
    // 阿里云SMS配置
    this.config = new OpenApi.Config({
      // 您的AccessKey ID (需要您提供)
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
      // 您的AccessKey Secret (需要您提供)
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
      // 接入地域和域名
      endpoint: 'dysmsapi.aliyuncs.com'
    });
    
    this.client = new Dysmsapi20170525.default(this.config);
    
    // 短信模板配置 (需要您在阿里云控制台申请)
    this.templates = {
      bind: {
        signName: process.env.SMS_SIGN_NAME || '综合测评系统',
        templateCode: process.env.SMS_BIND_TEMPLATE || 'SMS_XXXXXX' // 需要您申请的模板CODE
      },
      reset: {
        signName: process.env.SMS_SIGN_NAME || '综合测评系统',
        templateCode: process.env.SMS_RESET_TEMPLATE || 'SMS_XXXXXX' // 需要您申请的模板CODE
      }
    };
    
    // 检查是否配置了必要的环境变量
    this.isConfigured = !!(
      process.env.ALIYUN_ACCESS_KEY_ID && 
      process.env.ALIYUN_ACCESS_KEY_SECRET &&
      process.env.SMS_SIGN_NAME
    );
  }

  /**
   * 发送验证码短信
   * @param {string} phoneNumber - 手机号码
   * @param {string} code - 验证码
   * @param {string} type - 短信类型 ('bind' | 'reset')
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async sendVerificationCode(phoneNumber, code, type = 'bind') {
    // 如果没有配置短信服务，使用模拟模式
    if (!this.isConfigured) {
      console.log(`[SMS模拟] 发送验证码到 ${phoneNumber}: ${code} (类型: ${type})`);
      return {
        success: true,
        message: '验证码发送成功（模拟模式）',
        mode: 'simulation'
      };
    }

    try {
      const template = this.templates[type];
      if (!template) {
        throw new Error(`不支持的短信类型: ${type}`);
      }

      const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
        phoneNumbers: phoneNumber,
        signName: template.signName,
        templateCode: template.templateCode,
        templateParam: JSON.stringify({
          code: code
        })
      });

      const runtime = new Util.RuntimeOptions({});
      const response = await this.client.sendSmsWithOptions(sendSmsRequest, runtime);
      
      if (response.body.code === 'OK') {
        console.log(`[SMS成功] 验证码已发送到 ${phoneNumber}`);
        return {
          success: true,
          message: '验证码发送成功',
          mode: 'real',
          bizId: response.body.bizId
        };
      } else {
        console.error(`[SMS失败] ${response.body.code}: ${response.body.message}`);
        return {
          success: false,
          message: `短信发送失败: ${response.body.message}`,
          mode: 'real'
        };
      }
    } catch (error) {
      console.error('[SMS错误]', error);
      
      // 如果短信服务出错，降级到模拟模式
      console.log(`[SMS降级] 发送验证码到 ${phoneNumber}: ${code} (类型: ${type})`);
      return {
        success: true,
        message: '验证码发送成功（降级到模拟模式）',
        mode: 'fallback'
      };
    }
  }

  /**
   * 验证手机号格式
   * @param {string} phoneNumber - 手机号码
   * @returns {boolean}
   */
  validatePhoneNumber(phoneNumber) {
    // 中国大陆手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * 获取服务状态
   * @returns {object}
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      signName: this.templates.bind.signName,
      hasAccessKey: !!process.env.ALIYUN_ACCESS_KEY_ID,
      hasSecret: !!process.env.ALIYUN_ACCESS_KEY_SECRET,
      hasTemplates: {
        bind: !!process.env.SMS_BIND_TEMPLATE,
        reset: !!process.env.SMS_RESET_TEMPLATE
      }
    };
  }
}

module.exports = new SMSService();
