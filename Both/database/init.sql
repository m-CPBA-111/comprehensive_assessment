-- 学生综合测评系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS student_evaluation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_evaluation;

-- 用户表（教师、学生、测评小组）
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    card_number VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('teacher', 'student', 'evaluation-group') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 学生信息表
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    card_number VARCHAR(50) UNIQUE NOT NULL,
    class VARCHAR(100) NOT NULL,
    major VARCHAR(100),
    grade VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 综合测评表
CREATE TABLE IF NOT EXISTS evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    basic_score DECIMAL(5,2) DEFAULT 0,
    leadership_score DECIMAL(5,2) DEFAULT 0,
    practice_score DECIMAL(5,2) DEFAULT 0,
    innovation_score DECIMAL(5,2) DEFAULT 0,
    bonus_score DECIMAL(5,2) DEFAULT 0,
    total_score DECIMAL(5,2) DEFAULT 0,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    evaluator_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_student_evaluation (student_id)
);

-- 申请表
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    application_project VARCHAR(255) NOT NULL,
    application_reason TEXT NOT NULL,
    evidence TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewer_id VARCHAR(50),
    review_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 插入测试用户数据
INSERT INTO users (id, name, card_number, password, role) VALUES
('T001', '张老师', 'T001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher'),
('S001', '李明', 'S001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('S002', '张三', 'S002', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('S003', '李四', 'S003', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('S004', '王五', 'S004', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('G001', '测评小组', 'G001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'evaluation-group');

-- 插入学生信息
INSERT INTO students (id, name, card_number, class, major, grade) VALUES
('S001', '李明', 'S001', '计算机21-1', '计算机科学与技术', '2021'),
('S002', '张三', 'S002', '计算机21-1', '计算机科学与技术', '2021'),
('S003', '李四', 'S003', '计算机21-1', '计算机科学与技术', '2021'),
('S004', '王五', 'S004', '计算机21-2', '计算机科学与技术', '2021');

-- 插入测试评分数据
INSERT INTO evaluations (student_id, basic_score, leadership_score, practice_score, innovation_score, bonus_score, total_score, status, evaluator_id) VALUES
('S002', 85.0, 88.0, 90.0, 85.0, 5.0, 353.0, 'completed', 'G001'),
('S003', 88.0, 85.0, 92.0, 87.0, 3.0, 355.0, 'completed', 'G001'),
('S004', 82.0, 80.0, 85.0, 83.0, 8.0, 338.0, 'completed', 'G001');

-- 插入测试申请数据
INSERT INTO applications (student_id, application_project, application_reason, evidence, status) VALUES
('S001', '优秀学生干部', '担任班长一年，工作认真负责，得到老师和同学的一致认可', '班级工作证明、同学推荐信、工作总结报告', 'pending'),
('S002', '创新创业加分', '参与大学生创新创业训练计划项目，并在省级比赛中获得三等奖', '获奖证书、项目证明、指导老师推荐信', 'pending'),
('S003', '学术竞赛加分', '参加全国大学生数学建模竞赛获得省级二等奖', '获奖证书、比赛作品、参赛证明', 'approved');

-- 创建索引以提高查询性能
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_evaluations_student_id ON evaluations(student_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_users_card_number ON users(card_number);
CREATE INDEX idx_users_role ON users(role);
