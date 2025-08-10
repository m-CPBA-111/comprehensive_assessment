import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../layouts/MainLayout.vue'
import { useUserStore } from '../stores/user.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      redirect: '/dashboard',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: 'deduction',
          name: 'deduction',
          component: () => import('../views/DeductionView.vue')
        },
        {
          path: 'bonus-entry',
          name: 'bonus-entry',
          component: () => import('../views/BonusEntryView.vue')
        },
        {
          path: 'deduction-review',
          name: 'deduction-review',
          component: () => import('../views/DeductionReviewView.vue')
        },
        {
          path: 'bonus-review',
          name: 'bonus-review',
          component: () => import('../views/BonusReviewView.vue')
        },
        {
          path: 'appeals',
          name: 'appeals',
          component: () => import('../views/AppealsView.vue')
        },
        {
          path: 'score-settings',
          name: 'score-settings',
          component: () => import('../views/ScoreSettingsView.vue')
        },
        {
          path: 'academic-score',
          name: 'academic-score',
          component: () => import('../views/AcademicScoreView.vue')
        },
        {
          path: 'second-class',
          name: 'second-class',
          component: () => import('../views/SecondClassView.vue')
        },
        {
          path: 'group-evaluation',
          name: 'group-evaluation',
          component: () => import('../views/GroupEvaluationView.vue')
        },
        {
          path: 'basic-scoring',
          name: 'basic-scoring',
          component: () => import('../views/BasicScoringView.vue')
        }
      ]
    }
  ]
})

// 路由守卫 - 确保只有登录用户才能访问受保护的页面
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 检查是否有有效的登录状态（同时检查store和localStorage）
  const isAuthenticated = userStore.isLoggedIn && localStorage.getItem('user-token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !isAuthenticated) {
    // 清理可能残留的状态
    userStore.clearUser()
    localStorage.removeItem('user-token')
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router