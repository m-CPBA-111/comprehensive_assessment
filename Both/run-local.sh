#!/bin/bash

# 启动学生综合测评系统 - 本地运行脚本

echo "=== 启动学生综合测评系统 ==="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查MySQL是否运行
if ! pgrep -x "mysqld" > /dev/null; then
    echo "警告: MySQL服务未运行，正在启动..."
    # 尝试启动MySQL (macOS)
    if command -v brew &> /dev/null; then
        brew services start mysql
    else
        echo "请手动启动MySQL服务"
    fi
fi

# 启动数据库初始化
echo "初始化数据库..."
mysql -u root -p < database/init.sql 2>/dev/null || echo "数据库可能已存在，继续..."

# 安装并启动后端
echo "安装后端依赖..."
cd backend
npm install 2>/dev/null || {
    echo "npm安装失败，尝试使用yarn..."
    yarn install
}

echo "启动后端服务..."
npm start &
BACKEND_PID=$!

# 返回根目录
cd ..

# 安装并启动前端
echo "安装前端依赖..."
cd frontend
npm install 2>/dev/null || {
    echo "npm安装失败，尝试使用yarn..."
    yarn install
}

echo "启动前端服务..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=== 系统启动完成 ==="
echo "前端地址: http://localhost:5173"
echo "后端地址: http://localhost:3001"
echo "数据库管理: 请使用MySQL客户端连接到localhost:3306"
echo ""
echo "测试账号:"
echo "教师: teacher001 / 123456"
echo "学生: student001 / 123456"
echo "测评小组: eval001 / 123456"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
