const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// 数据库连接
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'database',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'student_evaluation',
  charset: 'utf8mb4'
})

// 测试数据库连接
db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err)
  } else {
    console.log('数据库连接成功')
  }
})

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 生成JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// 验证Token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: '访问被拒绝，需要token' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token无效' })
    }
    req.user = user
    next()
  })
}

// 登录接口
app.post('/api/login', (req, res) => {
  console.log('收到登录请求:', req.body)
  const { cardNumber, password } = req.body
  
  // 去除前后空格
  const trimmedCardNumber = cardNumber?.trim()
  const trimmedPassword = password?.trim()
  
  console.log('处理后的数据:', { cardNumber: trimmedCardNumber, password: '******' })

  const query = 'SELECT * FROM users WHERE card_number = ?'
  db.query(query, [trimmedCardNumber], async (err, results) => {
    if (err) {
      console.log('数据库查询错误:', err)
      return res.status(500).json({ message: '服务器错误', error: err })
    }

    console.log('查询结果:', results.length, '条记录')
    if (results.length === 0) {
      console.log('用户不存在:', trimmedCardNumber)
      return res.status(401).json({ message: '用户不存在' })
    }

    const user = results[0]
    console.log('找到用户:', user.name, user.role)
    const isValidPassword = await bcrypt.compare(trimmedPassword, user.password)

    if (!isValidPassword) {
      console.log('密码错误')
      return res.status(401).json({ message: '密码错误' })
    }

    console.log('登录成功:', user.name)
    const token = generateToken(user)
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        cardNumber: user.card_number
      }
    })
  })
})

// 获取学生列表（教师端）
app.get('/api/students', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: '权限不足' })
  }

  const query = `
    SELECT s.id, s.name, s.card_number as cardNumber,
           COALESCE(e.basic_score, 0) as academicScore,
           COALESCE(e.leadership_score, 0) as moralScore,
           COALESCE(e.practice_score, 0) as practiceScore,
           COALESCE(e.total_score, 0) as totalScore
    FROM students s
    LEFT JOIN evaluations e ON s.id = e.student_id
  `
  
  console.log('执行学生查询...')
  db.query(query, (err, results) => {
    if (err) {
      console.error('查询学生数据失败:', err)
      return res.status(500).json({ message: '服务器错误', error: err })
    }
    console.log('学生数据查询成功，返回', results.length, '条记录')
    console.log('第一条记录:', results[0])
    res.json(results)
  })
})

// 更新学生评分
app.put('/api/students/:id/scores', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'evaluation-group') {
    return res.status(403).json({ message: '权限不足' })
  }

  const { id } = req.params
  const { academicScore, moralScore, practiceScore } = req.body
  const totalScore = academicScore + moralScore + practiceScore

  console.log('更新学生评分:', id, { academicScore, moralScore, practiceScore, totalScore })

  const query = `
    INSERT INTO evaluations (student_id, basic_score, leadership_score, practice_score, total_score, status, evaluator_id, updated_at)
    VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW())
    ON DUPLICATE KEY UPDATE
    basic_score = VALUES(basic_score),
    leadership_score = VALUES(leadership_score),
    practice_score = VALUES(practice_score),
    total_score = VALUES(total_score),
    status = 'completed',
    evaluator_id = VALUES(evaluator_id),
    updated_at = NOW()
  `

  db.query(query, [id, academicScore, moralScore, practiceScore, totalScore, req.user.id], (err, results) => {
    if (err) {
      console.error('更新评分失败:', err)
      return res.status(500).json({ message: '服务器错误', error: err })
    }
    console.log('评分更新成功')
    res.json({ success: true, message: '评分更新成功' })
  })
})

// 获取申请列表
app.get('/api/applications', authenticateToken, (req, res) => {
  if (req.user.role !== 'evaluation-group') {
    return res.status(403).json({ message: '权限不足' })
  }

  const query = `
    SELECT a.*, s.name as student_name, s.class
    FROM applications a
    JOIN students s ON a.student_id = s.id
    ORDER BY a.created_at DESC
  `

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误', error: err })
    }
    res.json(results)
  })
})

// 提交申请（学生端）
app.post('/api/applications', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: '权限不足' })
  }

  const { applicationProject, applicationReason, evidence } = req.body
  const studentId = req.user.id

  const query = `
    INSERT INTO applications (student_id, application_project, application_reason, evidence, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', NOW())
  `

  db.query(query, [studentId, applicationProject, applicationReason, evidence], (err, results) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误', error: err })
    }
    res.json({ success: true, message: '申请提交成功' })
  })
})

// 审核申请
app.put('/api/applications/:id/review', authenticateToken, (req, res) => {
  if (req.user.role !== 'evaluation-group') {
    return res.status(403).json({ message: '权限不足' })
  }

  const { id } = req.params
  const { status } = req.body

  const query = 'UPDATE applications SET status = ?, reviewed_at = NOW() WHERE id = ?'
  
  db.query(query, [status, id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误', error: err })
    }
    res.json({ success: true, message: '审核完成' })
  })
})

// 修改密码
app.put('/api/users/password', authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body
  const userId = req.user.id

  // 先验证旧密码
  const query = 'SELECT password FROM users WHERE id = ?'
  db.query(query, [userId], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误', error: err })
    }

    const user = results[0]
    const isValidPassword = await bcrypt.compare(oldPassword, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: '原密码错误' })
    }

    // 更新新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?'
    
    db.query(updateQuery, [hashedPassword, userId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误', error: err })
      }
      res.json({ success: true, message: '密码修改成功' })
    })
  })
})

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: '服务器内部错误' })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${PORT}`)
})
