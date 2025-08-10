# 综合评价系统 API 接口文档

## 基础信息
- **基础URL**: http://localhost:3000
- **认证方式**: Bearer Token (JWT)

## 认证接口

### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "campusId": "320230901061",
  "password": "123456"
}
```

### 修改密码
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "123456",
  "newPassword": "newPassword123"
}
```

## 数据管理接口

### 获取学生列表
```http
GET /api/students
Authorization: Bearer <token>
```

### 更新学生成绩
```http
PUT /api/students/{campusId}/scores
Authorization: Bearer <token>
Content-Type: application/json

{
  "academicScore": 85.5,
  "secondClassScore": 92.0,
  "evaluationScore": 88.0,
  "bonusScore": 5.0
}
```

### 获取评价设置
```http
GET /api/settings
Authorization: Bearer <token>
```

### 更新评价设置
```http
PUT /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "academicPercentage": 60,
  "secondClassPercentage": 20,
  "evaluationPercentage": 20,
  "maxBonusScore": 20
}
```

### 健康检查
```http
GET /api/health
```

## 数据库表结构

### users（用户表）
- `id`: 主键
- `campus_id`: 校园卡号
- `password`: 加密密码
- `name`: 姓名
- `department`: 院系
- `major`: 专业
- `class`: 班级
- `role`: 角色（student/teacher/group_leader/admin）
- `is_first_login`: 是否首次登录

### students（学生成绩表）
- `id`: 主键
- `campus_id`: 学号
- `name`: 姓名
- `class`: 班级
- `academic_score`: 学业成绩
- `second_class_score`: 第二课堂成绩
- `evaluation_score`: 综合评价成绩
- `bonus_score`: 附加分
- `final_score`: 最终成绩

### evaluation_settings（评价设置表）
- `id`: 设置ID
- `academic_percentage`: 学业成绩百分比
- `second_class_percentage`: 第二课堂百分比
- `evaluation_percentage`: 综合评价百分比
- `max_bonus_score`: 最大附加分

### deduction_records（扣分记录表）
- `id`: 主键
- `student_campus_id`: 学生学号
- `reason`: 扣分原因
- `score`: 扣分分数
- `status`: 状态（pending/approved/rejected）
- `operator_id`: 操作员ID
- `operator_name`: 操作员姓名

## 示例使用

### 1. 登录获取Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"campusId":"320230901061","password":"123456"}'
```

### 2. 获取学生列表
```bash
curl -X GET http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. 更新学生成绩
```bash
curl -X PUT http://localhost:3000/api/students/320230901001/scores \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"academicScore":85.5,"secondClassScore":92.0,"evaluationScore":88.0,"bonusScore":5.0}'
```
