# 综合评价系统 - 技术栈与环境要求

## 📋 系统概述
学生综合评价管理系统，基于前后端分离架构，使用Docker容器化部署。

## 🐳 容器化环境

### Docker & Docker Compose
```bash
Docker Engine: >= 20.10.0
Docker Compose: >= 2.0.0
```

**安装方式:**
- macOS: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

## 🎨 前端技术栈

### 核心框架
```json
{
  "vue": "^3.5.17",
  "vue-router": "^4.5.0",
  "pinia": "^3.0.3"
}
```

### UI框架
```json
{
  "vuetify": "^3.9.2",
  "@mdi/font": "^7.4.47"
}
```

### 构建工具
```json
{
  "vite": "^7.0.0",
  "@vitejs/plugin-vue": "^6.0.0",
  "vite-plugin-vue-devtools": "^7.7.7"
}
```

### HTTP客户端
```json
{
  "axios": "^1.6.0"
}
```

### 前端运行环境
```dockerfile
# 构建阶段
FROM node:22-alpine

# 生产阶段
FROM nginx:alpine
```

## ⚙️ 后端技术栈

### Node.js 运行时
```json
{
  "node": "22.x",
  "npm": "^10.x"
}
```

### Web框架
```json
{
  "express": "^4.19.2",
  "cors": "^2.8.5"
}
```

### 数据库连接
```json
{
  "mysql2": "^3.11.0"
}
```

### 认证与安全
```json
{
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3"
}
```

### 数据验证
```json
{
  "joi": "^17.13.1"
}
```

### 环境配置
```json
{
  "dotenv": "^16.4.5"
}
```

### 后端运行环境
```dockerfile
FROM node:22-alpine
```

## 🗄️ 数据库技术栈

### MySQL 数据库
```yaml
mysql:
  image: mysql:8.0
  version: "8.0.x"
  charset: utf8mb4
  collation: utf8mb4_unicode_ci
```

### 数据库管理工具
```yaml
phpmyadmin:
  image: arm64v8/phpmyadmin:latest
  version: "5.x"
```

## 🌐 Web服务器

### Nginx (前端代理)
```yaml
nginx:
  image: nginx:alpine
  version: "1.25.x"
```

## 🛠️ 开发工具推荐

### 代码编辑器
```bash
Visual Studio Code: >= 1.80.0
```

**推荐扩展:**
```json
{
  "Vue.volar": "Vue语言服务器",
  "Vue.vscode-typescript-vue-plugin": "Vue TypeScript支持",
  "ms-vscode.vscode-json": "JSON支持",
  "bradlc.vscode-tailwindcss": "CSS智能提示",
  "ms-vscode-remote.remote-containers": "Docker容器开发"
}
```

### API测试工具
```bash
Postman: >= 10.0
# 或者
curl: 系统自带
# 或者
HTTPie: >= 3.0
```

### 数据库客户端
```bash
MySQL Workbench: >= 8.0
# 或者
DBeaver: >= 23.0
# 或者直接使用
phpMyAdmin: 通过 http://localhost:8081 访问
```

## 💻 系统要求

### 最低配置
```
CPU: 2核心
内存: 4GB RAM
硬盘: 10GB 可用空间
网络: 稳定的互联网连接
```

### 推荐配置
```
CPU: 4核心及以上
内存: 8GB RAM及以上
硬盘: 20GB 可用空间
网络: 稳定的互联网连接
```

## 🔧 环境变量配置

### 前端环境变量 (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 后端环境变量 (.env)
```bash
NODE_ENV=production
DB_HOST=database
DB_PORT=3306
DB_NAME=evaluation_system
DB_USER=eval_user
DB_PASSWORD=eval_password123
JWT_SECRET=eval-system-secret-key
PORT=3000
```

### 数据库环境变量
```bash
MYSQL_ROOT_PASSWORD=root_password123
MYSQL_DATABASE=evaluation_system
MYSQL_USER=eval_user
MYSQL_PASSWORD=eval_password123
```

## 📦 项目依赖文件

### 前端 package.json
```json
{
  "name": "comprehensive-evaluation-system",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "pinia": "^3.0.3",
    "vue": "^3.5.17",
    "vue-router": "^4.5.0",
    "vuetify": "^3.9.2"
  },
  "devDependencies": {
    "@mdi/font": "^7.4.47",
    "@vitejs/plugin-vue": "^6.0.0",
    "vite": "^7.0.0",
    "vite-plugin-vue-devtools": "^7.7.7"
  }
}
```

### 后端 package.json
```json
{
  "name": "evaluation-backend",
  "version": "1.0.0",
  "description": "综合评价系统后端API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "mysql2": "^3.11.0",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.13.1",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## 🚀 快速启动命令

### 使用Docker (推荐)
```bash
# 构建并启动所有服务
docker-compose up --build -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 本地开发模式
```bash
# 前端开发
cd frontend
npm install
npm run dev

# 后端开发 (新终端)
cd backend
npm install
npm start

# 数据库需要单独启动 MySQL 8.0
```

## 🌍 访问地址

```bash
前端应用: http://localhost:8080
后端API: http://localhost:3000
数据库管理: http://localhost:8081
MySQL数据库: localhost:3306
```

## ⚠️ 注意事项

1. **端口占用**: 确保 8080、3000、3306、8081 端口未被占用
2. **Docker内存**: 建议分配至少 4GB 内存给 Docker
3. **网络连接**: 首次运行需要下载Docker镜像，需要稳定网络
4. **数据持久化**: 数据库数据存储在Docker卷中，删除容器不会丢失数据
5. **开发调试**: 建议使用VS Code + Docker扩展进行开发

## 📚 相关文档

- [Vue.js 官方文档](https://vuejs.org/)
- [Vuetify 组件库](https://vuetifyjs.com/)
- [Express.js 文档](https://expressjs.com/)
- [MySQL 8.0 文档](https://dev.mysql.com/doc/refman/8.0/en/)
- [Docker 官方文档](https://docs.docker.com/)

---
**更新时间**: 2025年8月4日  
**系统版本**: v1.0.0
