# 🔧 Docker 容器名称说明

## 📊 容器清单

| 原名称 | 新名称 | 中文说明 | 功能描述 |
|--------|--------|----------|----------|
| `eval-frontend` | `math-class-evaluation-frontend` | 数学基地班综评系统-前端 | Vue.js前端应用，提供用户界面 |
| `eval-backend` | `math-class-evaluation-backend` | 数学基地班综评系统-后端 | Node.js后端API，处理业务逻辑 |
| `eval-database` | `math-class-evaluation-database` | 数学基地班综评系统-数据库 | MySQL 8.0数据库，存储学生成绩 |
| `eval-phpmyadmin` | `math-class-evaluation-phpmyadmin` | 数学基地班综评系统-数据库管理 | phpMyAdmin数据库管理界面 |

## 🌐 访问信息

### 前端系统
- **容器名**: `math-class-evaluation-frontend`
- **访问地址**: http://localhost:8080
- **用途**: 学生和老师使用的综合评价系统界面

### 后端API
- **容器名**: `math-class-evaluation-backend`
- **访问地址**: http://localhost:3000
- **用途**: 提供REST API接口，处理前端请求

### 数据库
- **容器名**: `math-class-evaluation-database`
- **访问地址**: localhost:3306
- **用途**: 存储学生信息、成绩数据、用户账号等

### 数据库管理
- **容器名**: `math-class-evaluation-phpmyadmin`
- **访问地址**: http://localhost:8081
- **用途**: 可视化数据库管理工具

## 🔑 登录信息

### 前端系统登录
- **管理员账号**: 320230901001
- **密码**: 123456
- **角色**: 组长 (group_leader)

### 数据库管理登录
- **用户名**: root
- **密码**: root_password123
- **权限**: 超级管理员

## 🚀 容器操作命令

### 查看容器状态
```bash
docker-compose ps
```

### 启动所有容器
```bash
docker-compose up -d
```

### 停止所有容器
```bash
docker-compose down
```

### 重新构建并启动
```bash
docker-compose down -v
docker-compose up -d
```

### 查看容器日志
```bash
# 查看前端日志
docker logs math-class-evaluation-frontend

# 查看后端日志
docker logs math-class-evaluation-backend

# 查看数据库日志
docker logs math-class-evaluation-database

# 查看phpMyAdmin日志
docker logs math-class-evaluation-phpmyadmin
```

## 📝 命名规则

容器名称采用统一格式：`math-class-evaluation-[组件名]`
- `math-class`: 数学基地班标识
- `evaluation`: 综合评价系统标识
- `[组件名]`: 具体功能模块（frontend/backend/database/phpmyadmin）

这样的命名方式：
- ✅ 清晰标识项目用途
- ✅ 便于管理和识别
- ✅ 符合Docker命名规范
- ✅ 避免与其他项目冲突
