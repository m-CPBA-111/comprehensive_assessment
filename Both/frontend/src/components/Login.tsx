import React, { useState } from 'react'

interface User {
  id: string
  name: string
  role: 'teacher' | 'student' | 'evaluation-group'
  cardNumber: string
}

interface LoginProps {
  onLogin: (user: User) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: formData.cardNumber,
          password: formData.password
        })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setMessage(`登录成功！欢迎您，${data.user.name}`)
        
        // 调用父组件的登录回调
        onLogin(data.user)
      } else {
        setMessage(data.message || '登录失败')
      }
    } catch (error) {
      console.error('登录错误:', error)
      setMessage('网络错误，请检查连接')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>学生综合测评系统</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cardNumber">校园卡号：</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="请输入校园卡号"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码：</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码"
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <div className="test-accounts">
          <h3>测试账号：</h3>
          <p>教师：teacher001 / 123456</p>
          <p>学生：student001 / 123456</p>
          <p>测评小组：eval001 / 123456</p>
        </div>
      </div>
    </div>
  )
}

export default Login
