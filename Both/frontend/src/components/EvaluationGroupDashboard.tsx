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

interface EvaluationGroupDashboardProps {
  user: User
  onLogout: () => void
}

const EvaluationGroupDashboard: React.FC<EvaluationGroupDashboardProps> = ({ user, onLogout }) => {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <Card style={{ height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={2}>测评小组工作台</Title>
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

        <Card title="申请审核" style={{ marginBottom: '20px' }}>
          <p>用户ID: {user.id}</p>
          <p>姓名: {user.name}</p>
          <p>校园卡号: {user.cardNumber}</p>
          <div style={{ marginTop: '20px' }}>
            <h4>功能开发中...</h4>
            <p>• 审核学生加分申请</p>
            <p>• 查看申请列表</p>
            <p>• 批准或拒绝申请</p>
          </div>
        </Card>
      </Card>
    </div>
  )
}

export default EvaluationGroupDashboard
