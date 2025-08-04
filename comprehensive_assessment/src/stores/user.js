import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const isLoggedIn = ref(false)
  const needsPasswordChange = ref(false)

  // 动作
  function login(userInfo) {
    user.value = userInfo
    isLoggedIn.value = true
  }

  function logout() {
    user.value = null
    isLoggedIn.value = false
    needsPasswordChange.value = false
    localStorage.removeItem('user-token')
  }

  function clearUser() {
    user.value = null
    isLoggedIn.value = false
    needsPasswordChange.value = false
  }

  function updateUser(updates) {
    if (user.value) {
      user.value = { ...user.value, ...updates }
    }
  }

  function setPasswordChangeRequired(required) {
    needsPasswordChange.value = required
  }

  return {
    // 状态
    user,
    isLoggedIn,
    needsPasswordChange,
    // 动作
    login,
    logout,
    clearUser,
    updateUser,
    setPasswordChangeRequired
  }
})
