import React, { useState, useEffect } from 'react'
import { Card, Button, Space, Typography, Table, Modal, Form, InputNumber, message } from 'antd'
import { LogoutOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface User {
  id: string
  name: string
  role: string
  cardNumber: string
}

interface Student {
  id: string
  name: string
  cardNumber: string
  academicScore: number
  moralScore: number
  practiceScore: number
  totalScore: number
}

interface TeacherDashboardProps {
  user: User
  onLogout: () => void
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [form] = Form.useForm()

  // 获取学生列表
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('获取学生数据:', data)
        setStudents(data)
      } else {
        console.error('获取学生列表失败')
        message.error('获取学生列表失败')
      }
    } catch (error) {
      console.error('网络错误:', error)
      message.error('网络连接失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // 打开编辑模态框
  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    form.setFieldsValue({
      academicScore: student.academicScore,
      moralScore: student.moralScore,
      practiceScore: student.practiceScore
    })
    setModalVisible(true)
  }

  // 保存评分
  const handleSave = async (values: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/students/${editingStudent?.id}/scores`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          academicScore: values.academicScore,
          moralScore: values.moralScore,
          practiceScore: values.practiceScore
        })
      })

      if (response.ok) {
        message.success('评分更新成功')
        setModalVisible(false)
        fetchStudents() // 重新获取数据
      } else {
        message.error('评分更新失败')
      }
    } catch (error) {
      console.error('更新评分错误:', error)
      message.error('网络连接失败')
    }
  }

  const columns: ColumnsType<Student> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '校园卡号',
      dataIndex: 'cardNumber',
      key: 'cardNumber',
    },
    {
      title: '学业成绩',
      dataIndex: 'academicScore',
      key: 'academicScore',
    },
    {
      title: '道德品质',
      dataIndex: 'moralScore',
      key: 'moralScore',
    },
    {
      title: '实践能力',
      dataIndex: 'practiceScore',
      key: 'practiceScore',
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: (_, record) => (
        <span style={{ fontWeight: 'bold' }}>
          {record.academicScore + record.moralScore + record.practiceScore}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          评分
        </Button>
      ),
    },
  ]

  return (
    <div style={{ width: '100%', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <Card style={{ height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={2}>教师工作台</Title>
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

        <Card title="学生综合测评管理" style={{ height: 'calc(100% - 100px)' }}>
          <Table
            columns={columns}
            dataSource={students}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ y: 'calc(100vh - 350px)' }}
          />
        </Card>

        <Modal
          title="学生评分"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
          width={600}
        >
          <Form
            form={form}
            onFinish={handleSave}
            layout="vertical"
          >
            <div style={{ marginBottom: '20px' }}>
              <strong>学生信息：</strong>
              <p>姓名：{editingStudent?.name}</p>
              <p>校园卡号：{editingStudent?.cardNumber}</p>
            </div>
            
            <Form.Item
              label="学业成绩分数"
              name="academicScore"
              rules={[
                { required: true, message: '请输入学业成绩分数' },
                { type: 'number', min: 0, max: 100, message: '分数范围为0-100' }
              ]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="请输入学业成绩分数（0-100）"
              />
            </Form.Item>

            <Form.Item
              label="道德品质分数"
              name="moralScore"
              rules={[
                { required: true, message: '请输入道德品质分数' },
                { type: 'number', min: 0, max: 100, message: '分数范围为0-100' }
              ]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="请输入道德品质分数（0-100）"
              />
            </Form.Item>

            <Form.Item
              label="实践能力分数"
              name="practiceScore"
              rules={[
                { required: true, message: '请输入实践能力分数' },
                { type: 'number', min: 0, max: 100, message: '分数范围为0-100' }
              ]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="请输入实践能力分数（0-100）"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default TeacherDashboard
