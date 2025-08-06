import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import TeacherDashboard from './components/TeacherDashboard'
import StudentDashboard from './components/StudentDashboard'
import EvaluationGroupDashboard from './components/EvaluationGroupDashboard'
import './index.css'

interface User {
  id: string
  name: string
  role: 'teacher' | 'student' | 'evaluation-group'
  cardNumber: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储中是否有用户信息
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('用户数据解析失败:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div>加载中...</div>
      </div>
    )
  }

  // 如果没有登录，显示登录页面
  if (!user) {
    return (
      <div className="App">
        <Login onLogin={handleLogin} />
      </div>
    )
  }

  // 根据用户角色显示对应的仪表板
  const renderDashboard = () => {
    switch (user.role) {
      case 'teacher':
        return <TeacherDashboard user={user} onLogout={handleLogout} />
      case 'student':
        return <StudentDashboard user={user} onLogout={handleLogout} />
      case 'evaluation-group':
        return <EvaluationGroupDashboard user={user} onLogout={handleLogout} />
      default:
        return <div>未知用户角色</div>
    }
  }

  return (
    <div className="App">
      {renderDashboard()}
    </div>
  )
}

export default App
