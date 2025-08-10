// 模拟数据库服务
export class MockDatabase {
  constructor() {
    // 初始化数据
    this.initializeData();
  }

  initializeData() {
    // 用户数据
    this.users = {
      '320230901061': {
        password: '123456',
        isFirstLogin: true,
        info: {
          campusId: '320230901061',
          name: '张靖宇',
          department: '计算机学院',
          major: '软件工程',
          class: '软件2301',
          role: 'group_leader'
        }
      },
      '123456': {
        password: 'password123',
        isFirstLogin: false,
        info: {
          campusId: '123456',
          name: '张三',
          department: '计算机学院',
          major: '软件工程',
          class: '软件2101',
          role: 'group_leader'
        }
      }
    };

    // 从localStorage加载用户状态
    Object.keys(this.users).forEach(campusId => {
      const savedState = localStorage.getItem(`user_${campusId}`);
      if (savedState) {
        const userState = JSON.parse(savedState);
        this.users[campusId].password = userState.password;
        this.users[campusId].isFirstLogin = userState.isFirstLogin;
      }
    });

    // 班级学生数据
    this.students = [
      { id: '320230901001', name: '艾建华', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
      { id: '320230901002', name: '白云飞', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
      { id: '320230901003', name: '陈明亮', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
      { id: '320230901004', name: '丁小雨', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
      { id: '320230901005', name: '方志强', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
      { id: '320230901006', name: '高晓松', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
      { id: '320230901007', name: '黄金海', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
      { id: '320230901008', name: '江南春', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
      { id: '320230901009', name: '康敏', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
      { id: '320230901010', name: '李晓霞', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
      { id: '320230901061', name: '张靖宇', class: '软件2301', basicScore: null, deductionScore: 0, bonusScore: 0, academicScore: null, secondClassScore: null, evaluationScore: null, finalScore: null },
    ];

    // 综测占比设置 (总分104分)
    this.scorePercentages = {
      academic: 60,        // 学业成绩 60%
      secondClass: 20,     // 第二课堂 20%
      evaluation: 20,      // 综合评价 20%
      bonus: 4             // 最大奖励分 4分
    };

    // 扣分记录
    this.deductionRecords = [
      {
        id: 1,
        studentId: '320230901003',
        studentName: '陈明亮',
        reason: '旷课1次',
        score: 2,
        status: 'pending', // pending, approved, rejected
        submittedAt: '2025-01-15',
        submittedBy: '320230901061'
      }
    ];

    // 奖励分申请
    this.bonusApplications = [
      {
        id: 1,
        studentId: '320230901005',
        studentName: '方志强',
        title: '参加数学建模竞赛',
        description: '参加全国大学生数学建模竞赛获得省级二等奖',
        evidence: '竞赛证书.pdf',
        score: 5,
        status: 'pending',
        submittedAt: '2025-01-10'
      },
      {
        id: 2,
        studentId: '320230901007',
        studentName: '黄金海',
        title: '志愿服务活动',
        description: '参加社区志愿服务累计40小时',
        evidence: '志愿服务证明.pdf',
        score: 3,
        status: 'pending',
        submittedAt: '2025-01-12'
      }
    ];

    // 申诉记录
    this.appeals = [
      {
        id: 1,
        studentId: '320230901003',
        studentName: '陈明亮',
        type: 'deduction', // deduction, bonus, basic
        title: '关于旷课扣分的申诉',
        content: '该次课程因生病住院未能到课，有医院证明',
        evidence: '住院证明.pdf',
        status: 'pending', // pending, processed
        submittedAt: '2025-01-16',
        reply: null
      }
    ];

    // 综测小组评价记录
    this.groupEvaluations = [
      {
        id: 1,
        studentId: '320230901003',
        studentName: '陈明亮',
        evaluationType: 'teacher', // teacher, peer
        evaluatorId: 'teacher001',
        evaluatorName: '李老师',
        scores: {
          moral: 8,      // 思想品德
          discipline: 9, // 纪律表现
          cooperation: 8, // 团队合作
          leadership: 7   // 领导能力
        },
        comments: '该学生表现良好，积极参与课堂活动',
        submittedAt: '2025-01-18'
      }
    ];

    // 第二课堂活动记录
    this.secondClassActivities = [
      {
        id: 1,
        studentId: '320230901005',
        studentName: '方志强',
        activityType: 'competition', // competition, volunteer, social, academic
        title: '数学建模竞赛',
        description: '参加全国大学生数学建模竞赛',
        score: 15,
        certificate: '竞赛证书.pdf',
        status: 'approved',
        submittedAt: '2025-01-10'
      },
      {
        id: 2,
        studentId: '320230901007',
        studentName: '黄金海',
        activityType: 'volunteer',
        title: '社区志愿服务',
        description: '参加社区清洁志愿服务活动',
        score: 8,
        certificate: '志愿证明.pdf',
        status: 'pending',
        submittedAt: '2025-01-12'
      }
    ];
  }

  // 用户认证
  async authenticateUser(campusId, password) {
    await this.simulateDelay();
    const user = this.users[campusId];
    if (user && user.password === password) {
      return { success: true, user };
    }
    return { success: false, error: '校园卡号或密码错误' };
  }

  // 修改密码
  async changePassword(campusId, oldPassword, newPassword) {
    await this.simulateDelay();
    const user = this.users[campusId];
    if (!user) {
      return { success: false, error: '用户不存在' };
    }
    if (user.password !== oldPassword) {
      return { success: false, error: '原密码不正确' };
    }
    
    // 更新密码和首次登录状态
    user.password = newPassword;
    user.isFirstLogin = false;
    
    // 持久化用户状态到localStorage
    const userState = {
      password: newPassword,
      isFirstLogin: false
    };
    localStorage.setItem(`user_${campusId}`, JSON.stringify(userState));
    
    return { success: true };
  }

  // 获取学生列表
  async getStudents() {
    await this.simulateDelay();
    return [...this.students].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  }

  // 保存基本素质分数
  async saveBasicScores(scores) {
    await this.simulateDelay();
    scores.forEach(({ studentId, score }) => {
      const student = this.students.find(s => s.id === studentId);
      if (student) {
        student.basicScore = score;
      }
    });
    return { success: true };
  }

  // 获取/保存综测占比
  async getScorePercentages() {
    await this.simulateDelay();
    return { ...this.scorePercentages };
  }

  async saveScorePercentages(percentages) {
    await this.simulateDelay();
    this.scorePercentages = { ...percentages };
    return { success: true };
  }

  // 扣分相关
  async submitDeduction(deduction) {
    await this.simulateDelay();
    const newRecord = {
      id: this.deductionRecords.length + 1,
      ...deduction,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };
    this.deductionRecords.push(newRecord);
    return { success: true };
  }

  async getDeductionRecords() {
    await this.simulateDelay();
    return [...this.deductionRecords];
  }

  async approveDeduction(id) {
    await this.simulateDelay();
    const record = this.deductionRecords.find(r => r.id === id);
    if (record) {
      record.status = 'approved';
      // 更新学生扣分
      const student = this.students.find(s => s.id === record.studentId);
      if (student) {
        student.deductionScore += record.score;
      }
    }
    return { success: true };
  }

  async rejectDeduction(id) {
    await this.simulateDelay();
    const record = this.deductionRecords.find(r => r.id === id);
    if (record) {
      record.status = 'rejected';
    }
    return { success: true };
  }

  // 奖励分相关
  async getBonusApplications() {
    await this.simulateDelay();
    return [...this.bonusApplications];
  }

  async approveBonus(id) {
    await this.simulateDelay();
    const application = this.bonusApplications.find(a => a.id === id);
    if (application) {
      application.status = 'approved';
      // 更新学生奖励分
      const student = this.students.find(s => s.id === application.studentId);
      if (student) {
        student.bonusScore += application.score;
      }
    }
    return { success: true };
  }

  async rejectBonus(id) {
    await this.simulateDelay();
    const application = this.bonusApplications.find(a => a.id === id);
    if (application) {
      application.status = 'rejected';
    }
    return { success: true };
  }

  // 申诉相关
  async getAppeals() {
    await this.simulateDelay();
    return [...this.appeals];
  }

  async replyAppeal(id, reply) {
    await this.simulateDelay();
    const appeal = this.appeals.find(a => a.id === id);
    if (appeal) {
      appeal.reply = reply;
      appeal.status = 'processed';
    }
    return { success: true };
  }

    // 模拟网络延迟
  simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  }

  // 综测小组相关方法

  // 获取第二课堂活动
  async getSecondClassActivities() {
    await this.simulateDelay();
    return [...this.secondClassActivities].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  // 审核第二课堂活动
  async reviewSecondClassActivity(activityId, status, comments = '') {
    await this.simulateDelay();
    const activity = this.secondClassActivities.find(a => a.id === activityId);
    if (activity) {
      activity.status = status;
      activity.reviewComments = comments;
      activity.reviewedAt = new Date().toISOString().split('T')[0];
      
      // 如果通过，更新学生第二课堂分数
      if (status === 'approved') {
        const student = this.students.find(s => s.id === activity.studentId);
        if (student) {
          student.secondClassScore = (student.secondClassScore || 0) + activity.score;
        }
      }
      return { success: true };
    }
    return { success: false, error: '活动不存在' };
  }

  // 获取小组评价记录
  async getGroupEvaluations() {
    await this.simulateDelay();
    return [...this.groupEvaluations].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  // 提交小组评价
  async submitGroupEvaluation(evaluation) {
    await this.simulateDelay();
    const newEvaluation = {
      id: this.groupEvaluations.length + 1,
      ...evaluation,
      submittedAt: new Date().toISOString().split('T')[0]
    };
    this.groupEvaluations.push(newEvaluation);
    
    // 计算并更新学生评价分数
    const studentEvaluations = this.groupEvaluations.filter(e => e.studentId === evaluation.studentId);
    const avgScore = studentEvaluations.reduce((sum, e) => {
      const scoreSum = Object.values(e.scores).reduce((s, score) => s + score, 0);
      return sum + scoreSum / Object.keys(e.scores).length;
    }, 0) / studentEvaluations.length;
    
    const student = this.students.find(s => s.id === evaluation.studentId);
    if (student) {
      student.evaluationScore = Math.round(avgScore * 10) / 10;
    }
    
    return { success: true, id: newEvaluation.id };
  }

  // 保存学业成绩
  async saveAcademicScores(scores) {
    await this.simulateDelay();
    scores.forEach(scoreData => {
      const student = this.students.find(s => s.id === scoreData.studentId);
      if (student) {
        student.academicScore = scoreData.score;
      }
    });
    this.calculateFinalScores();
    return { success: true };
  }

  // 计算最终综测成绩
  calculateFinalScores() {
    this.students.forEach(student => {
      if (student.academicScore !== null && 
          student.secondClassScore !== null && 
          student.evaluationScore !== null) {
        
        const academic = student.academicScore * (this.scorePercentages.academic / 100);
        const secondClass = student.secondClassScore * (this.scorePercentages.secondClass / 100);
        const evaluation = student.evaluationScore * (this.scorePercentages.evaluation / 100);
        const bonus = (student.bonusScore || 0) * (this.scorePercentages.bonus / 100);
        
        student.finalScore = Math.round((academic + secondClass + evaluation + bonus) * 10) / 10;
      }
    });
  }

  // 获取综测成绩排名
  async getFinalScoreRanking() {
    await this.simulateDelay();
    return this.students
      .filter(s => s.finalScore !== null)
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));
  }

  // 提交第二课堂活动
  async submitSecondClassActivity(activity) {
    await this.simulateDelay();
    const newActivity = {
      id: this.secondClassActivities.length + 1,
      ...activity,
      submittedAt: new Date().toISOString().split('T')[0]
    };
    this.secondClassActivities.push(newActivity);
    return { success: true, id: newActivity.id };
  }
}

// 全局数据库实例
export const mockDB = new MockDatabase();
