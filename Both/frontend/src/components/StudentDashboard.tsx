import React from 'react'
import { Card, Button, Space, Typography } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'

const { Title } = Typography

interface User {
  id: string
  name: string
  role: string
  cardNumber: string
}

interface StudentDashboardProps {
  user: User
  onLogout: () => void
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <Card style={{ height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={2}>学生个人中心</Title>
          <Space>
            <span>欢迎您，{user.name}</span>
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={onLogout}
            >
              退出登录
            </Button>
          </Space>
        </div>

        <Card title="个人信息" style={{ marginBottom: '20px' }}>
          <p><strong>用户ID:</strong> {user.id}</p>
          <p><strong>姓名:</strong> {user.name}</p>
          <p><strong>校园卡号:</strong> {user.cardNumber}</p>
          <p><strong>身份:</strong> 学生</p>
        </Card>

        <Card title="我的成绩" style={{ marginBottom: '20px' }}>
          <div style={{ marginTop: '20px' }}>
            <h4>功能开发中...</h4>
            <p>• 查看综合测评成绩</p>
            <p>• 查看各项评分详情</p>
            <p>• 提交加分申请</p>
            <p>• 查看申请状态</p>
          </div>
        </Card>
      </Card>
    </div>
  )
}

export default StudentDashboard
