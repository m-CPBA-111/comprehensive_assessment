# 学生综合测评系统

基于Docker的现代化学生综合测评管理系统，支持教师、学生和测评小组三种角色的协同工作。

## 🌟 系统特色

- **完全Docker化**: 一键启动，无需复杂环境配置
- **角色分离**: 教师、学生、测评小组各自独立的管理界面
- **现代化界面**: 基于Ant Design的响应式设计
- **安全可靠**: JWT认证 + MySQL数据持久化

## 🏗️ 技术架构

### 前端技术栈
- React 18 + TypeScript
- Ant Design UI组件库
- React Router v6
- Vite构建工具

### 后端技术栈
- Node.js + Express
- MySQL 8.0数据库
- JWT身份认证
- BCrypt密码加密

### 部署方案
- Docker + Docker Compose
- 前后端分离部署
- 数据库容器化
- 开发环境热重载

## 🚀 快速开始

### 系统要求
- Docker 20.0+
- Docker Compose 2.0+

### 启动步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd Both
```

2. **启动所有服务**
```bash
docker-compose up -d
```

3. **访问系统**
- 前端应用: http://localhost:3000
- 后端API: http://localhost:3001
- 数据库管理: http://localhost:8080 (phpMyAdmin)

### 测试账号

| 角色 | 账号 | 密码 | 说明 |
|------|------|------|------|
| 教师 | teacher001 | 123456 | 教师管理界面 |
| 学生 | student001 | 123456 | 学生个人中心 |
| 测评小组 | eval001 | 123456 | 测评管理界面 |

## 📋 功能模块

### 1. 登录认证系统
- 校园卡号 + 密码登录
- 角色自动识别跳转
- JWT Token认证

### 2. 教师管理界面
- 学生综合测评数据查看
- 评分结果编辑和管理
- 数据导出功能

### 3. 学生个人中心
- 个人信息查看
- 综合测评结果展示
- 各类申请提交
- 密码修改功能

### 4. 测评小组界面
- 学生综合测评评分
- 多维度评分体系
- 申请审核管理
- 结果统计分析

## 📊 数据库设计

### 核心数据表
- `users`: 用户基础信息
- `students`: 学生详细信息
- `evaluations`: 综合测评记录
- `applications`: 申请管理

### 评分体系
- 基本素质分 (0-100分)
- 学习成绩分 (0-100分)
- 德育成绩分 (0-100分)
- 加分项 (0-20分)

## 🔧 开发指南

### 本地开发

1. **前端开发**
```bash
cd frontend
npm install
npm run dev
```

2. **后端开发**
```bash
cd backend
npm install
npm run dev
```

3. **数据库**
```bash
docker-compose up database -d
```

### 项目结构
```
Both/
├── frontend/           # React前端应用
│   ├── src/
│   │   ├── components/ # 页面组件
│   │   ├── contexts/   # React Context
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
├── backend/            # Node.js后端API
│   ├── src/
│   │   └── index.js    # 主服务文件
│   ├── Dockerfile
│   └── package.json
├── database/           # 数据库初始化
│   └── init.sql        # 初始化SQL脚本
└── docker-compose.yml  # Docker编排文件
```

## 🐳 Docker配置说明

### 服务端口映射
- Frontend: 3000 → 3000
- Backend: 3001 → 3001
- MySQL: 3306 → 3306
- phpMyAdmin: 8080 → 80

### 数据持久化
- MySQL数据存储在Docker Volume中
- 开发时代码热重载

## 📝 API接口文档

### 认证接口
- `POST /api/login` - 用户登录
- `PUT /api/users/password` - 修改密码

### 学生管理
- `GET /api/students` - 获取学生列表
- `PUT /api/students/:id/score` - 更新学生评分

### 申请管理
- `GET /api/applications` - 获取申请列表
- `POST /api/applications` - 提交申请
- `PUT /api/applications/:id/review` - 审核申请

## 🔒 安全特性

- JWT Token身份认证
- BCrypt密码哈希加密
- SQL注入防护
- CORS跨域配置
- 角色权限控制

## 📱 界面特性

- 响应式设计，支持移动端
- 中文本地化支持
- Ant Design组件库
- 现代化交互体验

## 🚀 部署建议

### 生产环境
1. 修改默认密码和JWT密钥
2. 配置HTTPS证书
3. 设置数据库备份策略
4. 配置日志管理
5. 设置监控告警

### 性能优化
- 前端代码压缩和分包
- 数据库索引优化
- API接口缓存
- CDN静态资源加速

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码变更
4. 发起Pull Request

## 📄 许可证

MIT License

## 📞 技术支持

如遇到问题，请提交Issue或联系开发团队。
