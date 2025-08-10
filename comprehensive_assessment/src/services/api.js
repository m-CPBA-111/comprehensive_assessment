// API 配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// HTTP 客户端类
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // 设置认证令牌
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // 获取默认请求头
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // 处理认证错误
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
        throw new Error('认证失败，请重新登录');
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // GET 请求
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  // POST 请求
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT 请求
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE 请求
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// 真实数据库 API 服务
export class DatabaseService {
  constructor() {
    this.client = new ApiClient();
  }

  // 用户认证
  async login(campusId, password) {
    try {
      const response = await this.client.post('/api/auth/login', {
        campusId,
        password
      });

      if (response.success) {
        // 保存认证令牌
        this.client.setToken(response.data.token);
        return {
          success: true,
          user: response.data.user
        };
      } else {
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败'
      };
    }
  }

  // 修改密码
  async changePassword(oldPassword, newPassword, phoneNumber, verificationCode) {
    try {
      const response = await this.client.post('/api/auth/change-password', {
        oldPassword,
        newPassword,
        phoneNumber,
        verificationCode
      });

      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '密码修改失败'
      };
    }
  }

  // 发送验证码（不需要认证）
  async sendVerificationCode(phoneNumber, type = 'bind', campusId = null) {
    try {
      // 对于验证码发送，不使用认证头
      const url = `${this.client.baseURL}/api/auth/send-verification-code`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          type,
          campusId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return {
        success: data.success,
        message: data.message,
        code: data.code // 开发环境下可能返回验证码
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '发送验证码失败'
      };
    }
  }

  // 通过手机号重置密码（不需要认证）
  async resetPasswordByPhone(campusId, phoneNumber, verificationCode, newPassword) {
    try {
      // 对于密码重置，不使用认证头
      const url = `${this.client.baseURL}/api/auth/reset-password-by-phone`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campusId,
          phoneNumber,
          verificationCode,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '密码重置失败'
      };
    }
  }

  // 获取学生列表
  async getStudents() {
    try {
      const response = await this.client.get('/api/students');
      
      if (response.success) {
        // 转换数据格式以兼容前端
        const students = response.data.map(student => ({
          id: student.campus_id,
          name: student.name,
          class: student.class,
          academicScore: student.academic_score,
          secondClassScore: student.second_class_score,
          evaluationScore: student.evaluation_score,
          bonusScore: student.bonus_score || 0,
          finalScore: student.final_score
        }));

        return students;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
      return [];
    }
  }

  // 更新学生成绩
  async updateStudentScore(studentId, scores) {
    try {
      const response = await this.client.put(`/api/students/${studentId}/scores`, {
        academicScore: scores.academicScore,
        secondClassScore: scores.secondClassScore,
        evaluationScore: scores.evaluationScore,
        bonusScore: scores.bonusScore
      });

      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新成绩失败'
      };
    }
  }

  // 保存基本素质分数
  async saveBasicScores(scores) {
    try {
      // 批量更新学生基本素质分数
      const promises = scores.map(scoreData => 
        this.updateStudentScore(scoreData.studentId, {
          evaluationScore: scoreData.score,
          academicScore: null,
          secondClassScore: null,
          bonusScore: null
        })
      );

      const results = await Promise.all(promises);
      
      // 检查是否所有更新都成功
      const allSuccessful = results.every(result => result.success);
      
      return {
        success: allSuccessful,
        message: allSuccessful ? '所有基本素质分保存成功' : '部分学生分数保存失败'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '保存基本素质分失败'
      };
    }
  }

  // 获取评价设置
  async getEvaluationSettings() {
    try {
      const response = await this.client.get('/api/settings');
      
      if (response.success) {
        return {
          academicPercentage: response.data.academic_percentage,
          secondClassPercentage: response.data.second_class_percentage,
          evaluationPercentage: response.data.evaluation_percentage,
          maxBonusScore: response.data.max_bonus_score
        };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('获取设置失败:', error);
      // 返回默认设置
      return {
        academicPercentage: 60,
        secondClassPercentage: 20,
        evaluationPercentage: 20,
        maxBonusScore: 20
      };
    }
  }

  // 更新评价设置
  async updateEvaluationSettings(settings) {
    try {
      const response = await this.client.put('/api/settings', {
        academicPercentage: settings.academicPercentage,
        secondClassPercentage: settings.secondClassPercentage,
        evaluationPercentage: settings.evaluationPercentage,
        maxBonusScore: settings.maxBonusScore
      });

      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新设置失败'
      };
    }
  }

  // 提交扣分记录
  async submitDeduction(deductionData) {
    try {
      const response = await this.client.post('/api/deduction', {
        studentId: deductionData.studentId,
        score: deductionData.score,
        reason: deductionData.reason
      });

      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '提交扣分记录失败'
      };
    }
  }

  // 获取扣分记录列表
  async getDeductionRecords(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.studentId) queryParams.append('studentId', params.studentId);
      if (params.operatorId) queryParams.append('operatorId', params.operatorId);

      const endpoint = `/api/deduction${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.client.get(endpoint);

      return {
        success: response.success,
        data: response.data || []
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取扣分记录失败',
        data: []
      };
    }
  }

  // 审核扣分记录
  async reviewDeduction(recordId, status, comment = '') {
    try {
      const response = await this.client.put(`/api/deduction/${recordId}/review`, {
        status,
        comment
      });

      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '审核扣分记录失败'
      };
    }
  }

  // 健康检查
  async healthCheck() {
    try {
      const response = await this.client.get('/api/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // 注销
  logout() {
    this.client.setToken(null);
  }
}

// 导出单例实例
export const databaseService = new DatabaseService();

// 导出API客户端（用于其他自定义请求）
export { ApiClient };
