const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
// SMS service temporarily disabled
// const smsService = require('./smsService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'eval-system-secret-key';

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'eval_user',
  password: process.env.DB_PASSWORD || 'eval_password123',
  database: process.env.DB_NAME || 'evaluation_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 验证JWT Token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供访问令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '令牌无效' });
    }
    req.user = user;
    next();
  });
};

// 路由定义

// 健康检查和短信服务状态
app.get('/api/health', (req, res) => {
  // SMS service temporarily disabled
  // const smsStatus = smsService.getStatus();
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    // sms: smsStatus
  });
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const schema = Joi.object({
      campusId: Joi.string().required(),
      password: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: '请求参数错误',
        details: error.details[0].message
      });
    }

    const { campusId, password } = value;

    // 查询用户
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE campus_id = ?',
      [campusId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }

    const user = rows[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }

    // 检查是否使用默认密码 "123456"
    const isDefaultPassword = await bcrypt.compare('123456', user.password);
    
    // 生成JWT Token
    const token = jwt.sign(
      { 
        userId: user.id, 
        campusId: user.campus_id, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          campusId: user.campus_id,
          name: user.name,
          department: user.department,
          major: user.major,
          class: user.class,
          role: user.role,
          isFirstLogin: isDefaultPassword ? 1 : 0, // 只有使用默认密码时才是首次登录
          needPasswordChange: isDefaultPassword // 只有密码是123456时才需要修改
        }
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 修改密码
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const schema = Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
      phoneNumber: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
      verificationCode: Joi.string().pattern(/^\d{6}$/).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: '请求参数错误',
        details: error.details[0].message
      });
    }

    const { oldPassword, newPassword, phoneNumber, verificationCode } = value;
    const userId = req.user.userId;

    // 获取用户当前密码
    const [rows] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 验证旧密码
    const isValidOldPassword = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isValidOldPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '原密码错误' 
      });
    }

    // 如果提供了手机号，验证验证码
    if (phoneNumber && verificationCode) {
      const [codeRows] = await pool.execute(
        'SELECT * FROM verification_codes WHERE phone_number = ? AND code = ? AND type = "bind" AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        [phoneNumber, verificationCode]
      );

      if (codeRows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: '验证码无效或已过期' 
        });
      }

      // 标记验证码为已使用
      await pool.execute(
        'UPDATE verification_codes SET used = TRUE WHERE id = ?',
        [codeRows[0].id]
      );
    } else if (phoneNumber && !verificationCode) {
      return res.status(400).json({ 
        success: false, 
        message: '绑定手机号需要验证码' 
      });
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码和手机号
    if (phoneNumber) {
      await pool.execute(
        'UPDATE users SET password = ?, phone_number = ?, is_first_login = false WHERE id = ?',
        [hashedNewPassword, phoneNumber, userId]
      );
    } else {
      await pool.execute(
        'UPDATE users SET password = ?, is_first_login = false WHERE id = ?',
        [hashedNewPassword, userId]
      );
    }

    res.json({
      success: true,
      message: phoneNumber ? '密码修改和手机号绑定成功' : '密码修改成功'
    });

  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 发送验证码
app.post('/api/auth/send-verification-code', async (req, res) => {
  try {
    const schema = Joi.object({
      phoneNumber: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
      type: Joi.string().valid('bind', 'reset').required(),
      campusId: Joi.string().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: '请求参数错误',
        details: error.details[0].message
      });
    }

    const { phoneNumber, type, campusId } = value;

    // 如果是重置密码，验证手机号是否绑定到指定用户
    if (type === 'reset') {
      if (!campusId) {
        return res.status(400).json({ 
          success: false, 
          message: '重置密码需要提供校园卡号' 
        });
      }

      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE campus_id = ? AND phone_number = ?',
        [campusId, phoneNumber]
      );

      if (userRows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: '该手机号未绑定到此账户' 
        });
      }
    }

    // 生成6位随机验证码
    const code = Math.random().toString().slice(-6).padStart(6, '0');
    
    // 设置过期时间（5分钟后）
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 清理同一手机号的旧验证码
    await pool.execute(
      'UPDATE verification_codes SET used = TRUE WHERE phone_number = ? AND type = ? AND used = FALSE',
      [phoneNumber, type]
    );

    // 保存新验证码
    await pool.execute(
      'INSERT INTO verification_codes (phone_number, code, type, campus_id, expires_at) VALUES (?, ?, ?, ?, ?)',
      [phoneNumber, code, type, campusId || null, expiresAt]
    );

    // 发送短信验证码 (temporarily disabled)
    // const smsResult = await smsService.sendVerificationCode(phoneNumber, code, type);
    const smsResult = { success: true }; // Simulate successful SMS sending
    
    if (!smsResult.success) {
      // 如果短信发送失败，删除刚才保存的验证码
      await pool.execute(
        'DELETE FROM verification_codes WHERE phone_number = ? AND code = ? AND type = ?',
        [phoneNumber, code, type]
      );
      
      return res.status(500).json({
        success: false,
        message: smsResult.message || '短信发送失败，请稍后重试'
      });
    }

    // 构建响应消息
    let responseMessage = '验证码发送成功，请注意查收';
    if (smsResult.mode === 'simulation' || smsResult.mode === 'fallback') {
      responseMessage += '（当前为开发模式，验证码已在控制台显示）';
    }

    res.json({
      success: true,
      message: responseMessage,
      // 开发环境或模拟模式下返回验证码
      ...((process.env.NODE_ENV === 'development' || smsResult.mode !== 'real') && { code }),
      smsMode: smsResult.mode
    });

  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '发送验证码失败' 
    });
  }
});

// 通过手机号重置密码
app.post('/api/auth/reset-password-by-phone', async (req, res) => {
  try {
    const schema = Joi.object({
      campusId: Joi.string().required(),
      phoneNumber: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
      verificationCode: Joi.string().pattern(/^\d{6}$/).required(),
      newPassword: Joi.string().min(6).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: '请求参数错误',
        details: error.details[0].message
      });
    }

    const { campusId, phoneNumber, verificationCode, newPassword } = value;

    // 验证用户是否存在且手机号匹配
    const [userRows] = await pool.execute(
      'SELECT id FROM users WHERE campus_id = ? AND phone_number = ?',
      [campusId, phoneNumber]
    );

    if (userRows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '校园卡号或手机号错误' 
      });
    }

    // 验证验证码
    const [codeRows] = await pool.execute(
      'SELECT * FROM verification_codes WHERE phone_number = ? AND code = ? AND type = "reset" AND campus_id = ? AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [phoneNumber, verificationCode, campusId]
    );

    if (codeRows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '验证码无效或已过期' 
      });
    }

    // 标记验证码为已使用
    await pool.execute(
      'UPDATE verification_codes SET used = TRUE WHERE id = ?',
      [codeRows[0].id]
    );

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await pool.execute(
      'UPDATE users SET password = ?, is_first_login = false WHERE id = ?',
      [hashedNewPassword, userRows[0].id]
    );

    res.json({
      success: true,
      message: '密码重置成功'
    });

  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '重置密码失败' 
    });
  }
});

// 获取学生列表
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        campus_id,
        name,
        class,
        academic_score,
        second_class_score,
        evaluation_score,
        bonus_score,
        final_score,
        created_at,
        updated_at
      FROM students 
      ORDER BY campus_id
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('获取学生列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 更新学生成绩
app.put('/api/students/:campusId/scores', authenticateToken, async (req, res) => {
  try {
    const schema = Joi.object({
      academicScore: Joi.number().min(0).max(100).allow(null),
      secondClassScore: Joi.number().min(0).max(100).allow(null),
      evaluationScore: Joi.number().min(0).max(100).allow(null),
      bonusScore: Joi.number().min(0).max(4).allow(null) // 奖励分最多4分
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: '请求参数错误',
        details: error.details[0].message
      });
    }

    const { campusId } = req.params;
    const { academicScore, secondClassScore, evaluationScore, bonusScore } = value;

    // 计算最终成绩 (需要根据配置的百分比)
    let finalScore = null;
    if (academicScore !== null && secondClassScore !== null && evaluationScore !== null) {
      // 默认比例：学业60% + 第二课堂20% + 综合评价20% + 附加分
      finalScore = (academicScore * 0.6) + (secondClassScore * 0.2) + (evaluationScore * 0.2) + (bonusScore || 0);
      // 104分制：60(学业) + 20(第二课堂) + 20(综合评价) + 4(奖励分) = 104分
      finalScore = Math.min(finalScore, 104); // 最高104分
      finalScore = Math.round(finalScore * 10) / 10; // 保留1位小数
    }

    // 更新学生成绩
    await pool.execute(`
      UPDATE students 
      SET academic_score = ?, 
          second_class_score = ?, 
          evaluation_score = ?, 
          bonus_score = ?, 
          final_score = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE campus_id = ?
    `, [academicScore, secondClassScore, evaluationScore, bonusScore, finalScore, campusId]);

    res.json({
      success: true,
      message: '成绩更新成功'
    });

  } catch (error) {
    console.error('更新学生成绩错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 获取评价设置
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM evaluation_settings WHERE id = 1'
    );

    const settings = rows[0] || {
      academic_percentage: 60,
      second_class_percentage: 20,
      evaluation_percentage: 20,
      max_bonus_score: 5
    };

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('获取设置错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 更新评价设置
app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const schema = Joi.object({
      academicPercentage: Joi.number().min(0).max(100).required(),
      secondClassPercentage: Joi.number().min(0).max(100).required(),
      evaluationPercentage: Joi.number().min(0).max(100).required(),
      maxBonusScore: Joi.number().min(0).max(10).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: '请求参数错误',
        details: error.details[0].message
      });
    }

    const { academicPercentage, secondClassPercentage, evaluationPercentage, maxBonusScore } = value;

    // 验证百分比总和
    if (academicPercentage + secondClassPercentage + evaluationPercentage !== 100) {
      return res.status(400).json({ 
        success: false, 
        message: '各项百分比总和必须等于100%' 
      });
    }

    // 更新或插入设置
    await pool.execute(`
      INSERT INTO evaluation_settings (id, academic_percentage, second_class_percentage, evaluation_percentage, max_bonus_score, updated_at)
      VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
      academic_percentage = VALUES(academic_percentage),
      second_class_percentage = VALUES(second_class_percentage),
      evaluation_percentage = VALUES(evaluation_percentage),
      max_bonus_score = VALUES(max_bonus_score),
      updated_at = VALUES(updated_at)
    `, [academicPercentage, secondClassPercentage, evaluationPercentage, maxBonusScore]);

    res.json({
      success: true,
      message: '设置更新成功'
    });

  } catch (error) {
    console.error('更新设置错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 提交扣分记录
app.post('/api/deduction', authenticateToken, async (req, res) => {
  try {
    // 输入验证
    const deductionSchema = Joi.object({
      studentId: Joi.string().required(),
      score: Joi.number().min(0).max(4).required(), // 扣分范围0-4分
      reason: Joi.string().min(5).max(200).required()
    });

    const { error, value } = deductionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入数据无效',
        details: error.details[0].message
      });
    }

    const { studentId, score, reason } = value;

    // 验证学生是否存在
    const [studentRows] = await pool.execute(
      'SELECT campus_id, name FROM students WHERE campus_id = ?',
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }

    const student = studentRows[0];

    // 插入扣分记录
    const [result] = await pool.execute(`
      INSERT INTO deduction_records (student_campus_id, reason, score, operator_id, operator_name, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `, [studentId, reason, score, req.user.campusId, req.user.name]);

    res.json({
      success: true,
      message: '扣分记录提交成功',
      data: {
        id: result.insertId,
        studentId,
        studentName: student.name,
        score,
        reason,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('提交扣分记录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 获取扣分记录列表
app.get('/api/deduction', authenticateToken, async (req, res) => {
  try {
    const { status, studentId, operatorId } = req.query;
    
    let whereClause = '1=1';
    let params = [];

    // 根据查询参数构建WHERE子句
    if (status) {
      whereClause += ' AND dr.status = ?';
      params.push(status);
    }

    if (studentId) {
      whereClause += ' AND dr.student_campus_id = ?';
      params.push(studentId);
    }

    if (operatorId) {
      whereClause += ' AND dr.operator_id = ?';
      params.push(operatorId);
    }

    // 如果是普通学生，只能查看自己提交的记录
    // 管理员、老师和小组成员可以查看所有记录进行审核
    if (req.user.role === 'student') {
      whereClause += ' AND dr.operator_id = ?';
      params.push(req.user.campusId);
    }

    const [rows] = await pool.execute(`
      SELECT 
        dr.id,
        dr.student_campus_id as studentId,
        s.name as studentName,
        dr.reason,
        dr.score,
        dr.status,
        dr.operator_id as operatorId,
        dr.operator_name as operatorName,
        DATE_FORMAT(dr.created_at, '%Y-%m-%d %H:%i:%s') as submittedAt,
        DATE_FORMAT(dr.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt
      FROM deduction_records dr
      LEFT JOIN students s ON dr.student_campus_id = s.campus_id
      WHERE ${whereClause}
      ORDER BY dr.created_at DESC
    `, params);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('获取扣分记录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 审核扣分记录（管理员、老师和小组成员）
app.put('/api/deduction/:id/review', authenticateToken, async (req, res) => {
  try {
    // 权限检查
    if (!['admin', 'teacher', 'group_member'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    const { id } = req.params;
    const { status, comment } = req.body;

    // 验证状态
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的审核状态'
      });
    }

    // 更新扣分记录状态
    const [result] = await pool.execute(
      'UPDATE deduction_records SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "pending"',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '记录不存在或已被审核'
      });
    }

    res.json({
      success: true,
      message: `扣分记录已${status === 'approved' ? '通过' : '拒绝'}`
    });

  } catch (error) {
    console.error('审核扣分记录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务正常运行',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📊 API文档: http://localhost:${PORT}/api/health`);
});

module.exports = app;
