<template>
  <v-container fluid>
    <v-img
      class="mx-auto my-6"
      max-width="318"
      src="https://math.lzu.edu.cn/images/logo.png"
    ></v-img>
    <v-row justify="center">
      <v-col md="4">
        <v-overlay :model-value="isLoading" class="justify-center align-center">
          <v-progress-circular
            indeterminate
            color="white"
          ></v-progress-circular>
        </v-overlay>
        <v-card class="pa-8 mx-auto">
          <v-card-title class="text-center">登录</v-card-title>
          <v-card-item>
            <v-sheet>
              <v-form @submit.prevent>
                <v-row dense>
                <v-col cols="12" md="7">
                <div class="text-subtitle-1 text-medium-emphasis">账号</div>
                <v-text-field
                  v-model="input.username"
                  density="compact"
                  placeholder="校园卡号"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  :rules="[rules.required, rules.max]"
                ></v-text-field>
                </v-col>
                <v-col cols="12" md="5" align-self="end">
                <v-autocomplete
                  v-model="input.usertype"
                  label="用户类型"
                  :items="usertypes"
                  item-title="content"
                  item-value="content"
                  variant="outlined"
                ></v-autocomplete>
                </v-col>
                </v-row>
                <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
                  密码
                  <a
                    class="text-caption text-decoration-none text-blue"
                    href=" "
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    忘了？那很坏了:(
                  </a >
                </div>
                <v-text-field
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visible ? 'text' : 'password'"
                v-model="input.password"
                density="compact"
                placeholder="统一身份认证密码"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                @click:append-inner="visible = !visible"
                :rules="[rules.required]"
                ></v-text-field>
                <v-btn type="submit" color="green-darken-2" @click="submit" block>
                  <span>登录</span>
                </v-btn>
              </v-form>
            </v-sheet>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
.backgroundimage {
  display: flex;
  flex-direction: column;
  background-size: 100% 100%;
  background-attachment: fixed;
 
  width: 100%;
  height: 100%;
  min-width: 900px;
  min-height: 1000px;
 
  justify-content: center;
  align-items: center;
}
</style>
  
<script setup>

import { ref } from "vue";
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter(); 

const visible = ref(false);

const input = ref({
  username: "",
  usertype: "",
  password: "",
});

const usertypes = [
  { content:'学生', key:'student', push:'/' },
  { content:'综测小组', key:'groupmember', push:'/' },
  { content:'教师', key:'teacher', push:'/home' },
]

function submit() {
  const username = input.value.username;
  const usertype = input.value.usertype;
  const password = input.value.password;

  if (!username || !password) {
    alert("账号或密码不能为空");
    return;
  }
  if (!usertype) {
    alert("请选择用户类型");
    return;
  }

  const index = usertypes.findIndex(type => type.content === usertype); 
  // 在数组 usertypes 中查找第一个满足条件的元素的索引
  // 条件为：该元素对象的content属性等于变量usertype。

  axios.post('http://localhost:5000/api/'+usertypes[index].key+'/login', {
    username,
    password,
  })
  .then(res => {
    console.log(res)
    if (res.data.success) {
      localStorage.setItem('id', username);
      router.push( usertypes[index].push )
  //  router.push({ name: 'Home', params: { id: username } })
    }
  })
  .catch(err => {
    alert('连不上或账号密码错误');
    console.log(err);
  });
}

const rules = {
  required: (value) => !!value || "不能为空。",
  max: (value) => value.length <= 12 || "最多12个字符。",
};
</script>