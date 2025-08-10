-- 综合评价系统数据库初始化脚本
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS evaluation_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE evaluation_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    campus_id VARCHAR(20) NOT NULL UNIQUE COMMENT '校园卡号',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    department VARCHAR(100) NOT NULL COMMENT '院系',
    major VARCHAR(100) NOT NULL COMMENT '专业',
    class VARCHAR(50) NOT NULL COMMENT '班级',
    role ENUM('student', 'teacher', 'group_leader', 'admin') DEFAULT 'student' COMMENT '角色',
    is_first_login BOOLEAN DEFAULT TRUE COMMENT '是否首次登录',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus_id (campus_id),
    INDEX idx_class (class),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 学生成绩表
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    campus_id VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    class VARCHAR(50) NOT NULL COMMENT '班级',
    academic_score DECIMAL(5,2) NULL COMMENT '学业成绩',
    second_class_score DECIMAL(5,2) NULL COMMENT '第二课堂成绩',
    evaluation_score DECIMAL(5,2) NULL COMMENT '综合评价成绩',
    bonus_score DECIMAL(5,2) DEFAULT 0 COMMENT '奖励分',
    final_score DECIMAL(5,2) NULL COMMENT '最终成绩',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus_id (campus_id),
    INDEX idx_class (class),
    INDEX idx_final_score (final_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生成绩表';

-- 评价设置表
CREATE TABLE IF NOT EXISTS evaluation_settings (
    id INT PRIMARY KEY DEFAULT 1,
    academic_percentage INT NOT NULL DEFAULT 60 COMMENT '学业成绩百分比',
    second_class_percentage INT NOT NULL DEFAULT 20 COMMENT '第二课堂百分比',
    evaluation_percentage INT NOT NULL DEFAULT 20 COMMENT '综合评价百分比',
    max_bonus_score INT NOT NULL DEFAULT 5 COMMENT '最大奖励分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价设置表';

-- 扣分记录表
CREATE TABLE IF NOT EXISTS deduction_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_campus_id VARCHAR(20) NOT NULL COMMENT '学生学号',
    reason VARCHAR(200) NOT NULL COMMENT '扣分原因',
    score DECIMAL(5,2) NOT NULL COMMENT '扣分分数',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '状态',
    operator_id VARCHAR(20) NOT NULL COMMENT '操作员ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作员姓名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_campus_id (student_campus_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (student_campus_id) REFERENCES students(campus_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='扣分记录表';

-- 附加分记录表
CREATE TABLE IF NOT EXISTS bonus_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_campus_id VARCHAR(20) NOT NULL COMMENT '学生学号',
    score DECIMAL(5,2) NOT NULL COMMENT '附加分分数',
    type VARCHAR(50) NOT NULL COMMENT '附加分类型',
    reason VARCHAR(200) NOT NULL COMMENT '附加分原因',
    operator_id VARCHAR(20) NOT NULL COMMENT '操作员ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作员姓名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_campus_id (student_campus_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (student_campus_id) REFERENCES students(campus_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='附加分记录表';

-- 插入初始用户数据（密码已加密，对应明文：123456）
INSERT INTO users (campus_id, password, name, department, major, class, role, is_first_login) VALUES
('320230901001', '$2a$10$hwoXTD3ggwNdBZjwFOHpuOlik868RjdSm5Xi9X4dt9IRZAPSzDZpi', '艾建华', '数学学院', '数学与应用数学', '数学基地班', 'group_leader', FALSE)
ON DUPLICATE KEY UPDATE
campus_id = VALUES(campus_id);

-- 插入学生数据
INSERT INTO students (campus_id, name, class) VALUES
('320230901001', '艾建华', '数学基地班'),
('320230901002', '白云飞', '数学基地班'),
('320230901003', '陈明亮', '数学基地班'),
('320230901004', '丁小雨', '数学基地班'),
('320230901005', '方志强', '数学基地班'),
('320230901006', '高晓松', '数学基地班'),
('320230901007', '黄金海', '数学基地班'),
('320230901008', '江南春', '数学基地班'),
('320230901009', '康敏', '数学基地班'),
('320230901010', '李晓霞', '数学基地班')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
class = VALUES(class);

-- 插入默认评价设置 (总分104分：学业60% + 第二课堂20% + 综合评价20% + 最大奖励分4分)
INSERT INTO evaluation_settings (id, academic_percentage, second_class_percentage, evaluation_percentage, max_bonus_score) VALUES
(1, 60, 20, 20, 4)
ON DUPLICATE KEY UPDATE
academic_percentage = VALUES(academic_percentage),
second_class_percentage = VALUES(second_class_percentage),
evaluation_percentage = VALUES(evaluation_percentage),
max_bonus_score = VALUES(max_bonus_score);

-- 插入一些示例扣分记录
INSERT INTO deduction_records (student_campus_id, reason, score, status, operator_id, operator_name) VALUES
('320230901002', '迟到', 2.0, 'approved', '320230901001', '艾建华'),
('320230901003', '未交作业', 5.0, 'pending', '320230901001', '艾建华'),
('320230901004', '课堂违纪', 3.0, 'approved', '320230901001', '艾建华')
ON DUPLICATE KEY UPDATE
reason = VALUES(reason);

-- 插入一些示例附加分记录
INSERT INTO bonus_records (student_campus_id, score, type, reason, operator_id, operator_name) VALUES
('320230901002', 2.0, '学术竞赛', '全国大学生数学建模竞赛省二等奖', '320230901001', '艾建华'),
('320230901003', 1.5, '志愿服务', '参与社区志愿服务活动50小时', '320230901001', '艾建华'),
('320230901004', 1.0, '科技创新', '参与大学生创新创业项目', '320230901001', '艾建华')
ON DUPLICATE KEY UPDATE
reason = VALUES(reason);

-- 创建视图：学生成绩汇总
CREATE OR REPLACE DEFINER=`root`@`%` VIEW student_score_summary AS
SELECT 
    s.campus_id,
    s.name,
    s.class,
    s.academic_score,
    s.second_class_score,
    s.evaluation_score,
    s.bonus_score,
    COALESCE(SUM(dr.score), 0) as total_deduction,
    s.final_score,
    CASE 
        WHEN s.final_score >= 90 THEN '优秀'
        WHEN s.final_score >= 80 THEN '良好'
        WHEN s.final_score >= 70 THEN '中等'
        WHEN s.final_score >= 60 THEN '及格'
        ELSE '不及格'
    END as grade_level,
    s.updated_at
FROM students s
LEFT JOIN deduction_records dr ON s.campus_id = dr.student_campus_id AND dr.status = 'approved'
GROUP BY s.campus_id, s.name, s.class, s.academic_score, s.second_class_score, s.evaluation_score, s.bonus_score, s.final_score, s.updated_at;

-- 创建存储过程：重新计算学生最终成绩
DELIMITER //
CREATE DEFINER=`root`@`%` PROCEDURE RecalculateStudentScores()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_campus_id VARCHAR(20);
    DECLARE v_academic_score DECIMAL(5,2);
    DECLARE v_second_class_score DECIMAL(5,2);
    DECLARE v_evaluation_score DECIMAL(5,2);
    DECLARE v_bonus_score DECIMAL(5,2);
    DECLARE v_academic_pct INT;
    DECLARE v_second_class_pct INT;
    DECLARE v_evaluation_pct INT;
    DECLARE v_final_score DECIMAL(5,2);
    
    -- 声明游标
    DECLARE student_cursor CURSOR FOR
        SELECT campus_id, academic_score, second_class_score, evaluation_score, bonus_score
        FROM students
        WHERE academic_score IS NOT NULL AND second_class_score IS NOT NULL AND evaluation_score IS NOT NULL;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- 获取评价设置
    SELECT academic_percentage, second_class_percentage, evaluation_percentage
    INTO v_academic_pct, v_second_class_pct, v_evaluation_pct
    FROM evaluation_settings WHERE id = 1;
    
    -- 打开游标
    OPEN student_cursor;
    
    read_loop: LOOP
        FETCH student_cursor INTO v_campus_id, v_academic_score, v_second_class_score, v_evaluation_score, v_bonus_score;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 计算最终成绩
        SET v_final_score = (v_academic_score * v_academic_pct / 100) + 
                           (v_second_class_score * v_second_class_pct / 100) + 
                           (v_evaluation_score * v_evaluation_pct / 100) + 
                           COALESCE(v_bonus_score, 0);
        
        -- 确保不超过100分
        SET v_final_score = LEAST(v_final_score, 100);
        
        -- 更新学生最终成绩
        UPDATE students SET final_score = v_final_score WHERE campus_id = v_campus_id;
        
    END LOOP;
    
    CLOSE student_cursor;
END//
DELIMITER ;

-- 创建触发器：自动计算最终成绩
DELIMITER //
CREATE DEFINER=`root`@`%` TRIGGER tr_calculate_final_score
BEFORE UPDATE ON students
FOR EACH ROW
BEGIN
    DECLARE v_academic_pct INT;
    DECLARE v_second_class_pct INT;
    DECLARE v_evaluation_pct INT;
    
    -- 获取评价设置
    SELECT academic_percentage, second_class_percentage, evaluation_percentage
    INTO v_academic_pct, v_second_class_pct, v_evaluation_pct
    FROM evaluation_settings WHERE id = 1;
    
    -- 如果三项成绩都不为空，自动计算最终成绩
    IF NEW.academic_score IS NOT NULL AND NEW.second_class_score IS NOT NULL AND NEW.evaluation_score IS NOT NULL THEN
        SET NEW.final_score = LEAST(
            (NEW.academic_score * v_academic_pct / 100) + 
            (NEW.second_class_score * v_second_class_pct / 100) + 
            (NEW.evaluation_score * v_evaluation_pct / 100) + 
            COALESCE(NEW.bonus_score, 0),
            100
        );
    END IF;
END//
DELIMITER ;

-- 授权用户权限
GRANT SELECT, INSERT, UPDATE, DELETE ON evaluation_system.* TO 'eval_user'@'%';
FLUSH PRIVILEGES;

-- 显示创建完成信息
SELECT '数据库初始化完成！' as message;
SELECT '默认用户账号：' as info, campus_id as '账号', '123456' as '密码', role as '角色' FROM users;
