# 韩子微的 Vue Todo App

基于 Vue 3 + TypeScript + Vite 构建的现代化 Todo 应用。

## 功能特性

- ✅ 添加新的待办事项
- ✅ 标记完成/未完成状态
- ✅ 删除待办事项
- ✅ 响应式设计
- ✅ TypeScript 类型安全
- ✅ Vue 3 Composition API

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 带有类型的 JavaScript 超集
- **Vite** - 下一代前端构建工具
- **CSS3** - 现代样式与渐变效果

## 开发环境设置

### 前提条件
- Node.js (版本 16 或更高)
- npm 或 yarn

### 安装与运行

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 在浏览器中打开: http://localhost:5173/

### 其他命令

- 构建生产版本：
```bash
npm run build
```

- 预览生产构建：
```bash
npm run preview
```

- 类型检查：
```bash
npm run type-check
```

## 项目结构

```
src/
├── components/
│   └── TodoApp.vue     # 主要的 Todo 应用组件
├── App.vue             # 根组件
└── main.ts             # 应用入口点
```

## 使用说明

1. 在输入框中输入待办事项内容
2. 点击 "Add to do" 按钮或按回车键添加
3. 点击复选框标记完成状态
4. 点击 "del" 按钮删除不需要的事项

## 开发

这个项目使用 Vue 3 的 Composition API 和 TypeScript，提供了更好的类型安全和开发体验。

组件采用了现代的 `<script setup>` 语法，使代码更加简洁易读。

## 许可证

MIT License
