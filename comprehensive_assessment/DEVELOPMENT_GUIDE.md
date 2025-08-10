# 综合评价系统 - 开发指南

## 数据库修改策略

### 🔧 通过代码修改（推荐用于系统配置）

#### 1. 系统设置修改
```sql
-- 修改评价百分比设置
UPDATE evaluation_settings 
SET academic_percentage = 60,
    second_class_percentage = 20,
    evaluation_percentage = 20,
    max_bonus_score = 5
WHERE id = 1;
```

#### 2. 表结构修改
```sql
-- 添加新字段
ALTER TABLE students ADD COLUMN new_field VARCHAR(100);

-- 修改字段类型
ALTER TABLE students MODIFY COLUMN bonus_score DECIMAL(5,2) DEFAULT 0;
```

#### 3. 重新部署
```bash
# 重新构建数据库
docker-compose down -v
docker-compose up -d
```

### 🖥️ 通过界面修改（推荐用于数据内容）

#### 1. phpMyAdmin (http://localhost:8081)
- **用户名**: root
- **密码**: root_password123
- 适合：SQL查询、批量数据操作、数据导入导出

#### 2. 系统前端界面 (http://localhost:8080)
- **管理员账号**: 320230901061
- **密码**: 123456
- 适合：日常数据录入、成绩管理、用户操作

## 最佳实践

### 🎯 结构性修改流程
1. 在 `database/init.sql` 中修改
2. 提交到版本控制
3. 重新部署容器
4. 验证修改结果

### 📝 数据修改流程
1. 通过前端界面或phpMyAdmin修改
2. 验证数据正确性
3. 如需要，备份重要数据

## 常见操作示例

### 修改学生信息
```sql
-- 通过phpMyAdmin执行
UPDATE students 
SET name = '张三', class = '计算机2023-1班' 
WHERE campus_id = '320230901001';
```

### 批量导入成绩
```sql
-- 批量更新学业成绩
UPDATE students SET academic_score = 85.5 WHERE campus_id = '320230901001';
UPDATE students SET academic_score = 92.0 WHERE campus_id = '320230901002';
```

### 修改评价百分比
```sql
-- 修改系统配置
UPDATE evaluation_settings 
SET academic_percentage = 65,
    second_class_percentage = 15 
WHERE id = 1;
```

## 数据备份

### 备份整个数据库
```bash
docker exec eval-database mysqldump -u root -proot_password123 evaluation_system > backup.sql
```

### 恢复数据库
```bash
docker exec -i eval-database mysql -u root -proot_password123 evaluation_system < backup.sql
```

## 安全注意事项

1. **生产环境**: 避免直接修改数据库，使用应用程序接口
2. **测试环境**: 可以直接操作数据库进行测试
3. **备份策略**: 重要修改前先备份数据
4. **权限控制**: 限制数据库直接访问权限

## 环境说明

- **开发环境**: 本地Docker容器，可以随意测试
- **生产环境**: 需要通过正规流程部署
- **数据持久化**: MySQL数据存储在Docker卷中
