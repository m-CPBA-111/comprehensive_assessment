/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
//import { routes } from 'vue-router/auto-routes'

const routes = [
       { path: '/login', 
         name: 'Login', 
         component: () => import('@/pages/login.vue'),
         meta: { guestOnly: true } 
       },
       { path: '/',
         component: () => import('@/layouts/layout.vue'),
         children: [
          { path: 'home', 
            name: 'Home', 
            component: () => import('@/pages/home.vue') 
          },
          { path: 'home/progress-query', 
            name: 'ProgressQuery', 
            component: () => import('@/pages/home/progress-query.vue') 
          },
          { path: 'home/authority-management', 
            name: 'AuthorityManagement', 
            component: () => import('@/pages/home/authority-management.vue') 
          },
          { path: 'home/grading', 
            name: 'Grading', 
            component: () => import('@/pages/home/grading.vue') 
          },
          { path: 'home/database-manipulation/CA-query', 
            name: 'CAquery', 
            component: () => import('@/pages/home/database-manipulation/CA-query.vue') 
          },
          { path: 'home/database-manipulation/GPA-importing', 
            name: 'GPAimporting', 
            component: () => import('@/pages/home/database-manipulation/GPA-importing.vue') 
          },
          { path: 'home/database-manipulation/CA-composition', 
            name: 'CAcomposition', 
            component: () => import('@/pages/home/database-manipulation/CA-composition.vue') 
          },
         ]},
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
/*
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.guestOnly && token) {
    next( { name: Home } ) // 已登录用户不能访问登录页
  } else {
    next()
  }
  if (to.path !== '/login' && !token) {
    next('/login') // 未登陆用户跳转登陆页
  } else {
    next()
  }
})
*/
// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
