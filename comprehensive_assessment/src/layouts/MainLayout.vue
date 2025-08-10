<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="操作台"
          value="dashboard"
          to="/dashboard"
        ></v-list-item>
        
        <v-divider></v-divider>
        <v-list-subheader>学业评分</v-list-subheader>
        <v-list-item
          prepend-icon="mdi-school-outline"
          title="学业成绩管理"
          value="academic-score"
          to="/academic-score"
        ></v-list-item>
        
        <v-divider></v-divider>
        <v-list-subheader>综测小组</v-list-subheader>
        <v-list-item
          prepend-icon="mdi-school"
          title="第二课堂管理"
          value="second-class"
          to="/second-class"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-group"
          title="综合评价管理"
          value="group-evaluation"
          to="/group-evaluation"
        ></v-list-item>
        
        <v-divider></v-divider>
        <v-list-subheader>审核管理</v-list-subheader>
         <v-list-item
          prepend-icon="mdi-minus-circle"
          title="扣除分录入"
          value="deduction"
          to="/deduction"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-plus-circle"
          title="附加分录入"
          value="bonus-entry"
          to="/bonus-entry"
        ></v-list-item>
        
        <!-- 对管理员、老师和小组成员显示审核功能 -->
        <template v-if="userStore.user?.role === 'admin' || userStore.user?.role === 'teacher' || userStore.user?.role === 'group_member'">
          <v-list-item
            prepend-icon="mdi-shield-check"
            title="扣除分审核"
            value="deduction-review"
            to="/deduction-review"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-star-check"
            title="附加分审核"
            value="bonus-review"
            to="/bonus-review"
          ></v-list-item>
        </template>
        
        <v-list-item
          prepend-icon="mdi-message-alert"
          title="申诉处理"
          value="appeals"
          to="/appeals"
        ></v-list-item>
      </v-list>
       <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="secondary" @click="logout">
            退出登录
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>综合测评系统</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-chip color="white" text-color="primary" class="font-weight-bold mr-2">
        <v-icon start icon="mdi-account-circle"></v-icon>
        {{ userStore.user?.name || '未登录' }}
      </v-chip>
      <v-btn
        icon="mdi-logout"
        @click="logout"
        title="退出登录"
      ></v-btn>
    </v-app-bar>

    <v-main style="background-color: #f5f5f5;">
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const drawer = ref(false);
const userStore = useUserStore();
const router = useRouter();

const logout = () => {
    localStorage.removeItem('user-token');
    userStore.clearUser();
    router.push('/login');
}
</script>