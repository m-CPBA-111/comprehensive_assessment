<template>
  <div class="todo-app">
    <div class="title">韩子微的ToDo App</div>
    <div class="todo-form">
      <input class="todo-input" type="text" v-model="newTodo" placeholder="Add a todo" />
      <button class="todo-button" @click="addTodo">Add to do</button>
    </div>
    <div v-for="(todo, index) in todos" :key="index" :class="['item', { completed: todo.completed }]">
      <div>
        <input type="checkbox" v-model="todo.completed" />
        <span class="name">{{ todo.name }}</span>
      </div>
      <button class="del" @click="deleteTodo(index)">del</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newTodo: '',
      todos: [
        { name: '吃饭', completed: true },
        { name: '学习', completed: false },
        { name: '睡觉', completed: false },
      ],
    };
  },
  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push({ name: this.newTodo, completed: false });
        this.newTodo = '';
      }
    },
    deleteTodo(index) {
      this.todos.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.completed {
  text-decoration: line-through;
  opacity: 0.4;
}
.del {
  color: red;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  width: 80%;
  height: 50px;
  margin: 8px auto;
  padding: 16px;
  border-radius: 20px;
  box-shadow: 0px 8px 20px rgba(149, 157, 165, 0.2);
}
.todo-button {
  width: 100px;
  height: 52px;
  border-radius: 0 20px 20px 0;
  line-height: 52px;
  text-align: center;
  background: linear-gradient(to right, rgb(113, 65, 168), rgba(44, 114, 251, 1));
  cursor: pointer;
  user-select: none;
  color: #fff;
}
.todo-input {
  margin-bottom: 20px;
  padding-left: 15px;
  border: 1px solid #dfe1e5;
  outline: none;
  width: 60%;
  height: 50px;
  border-radius: 20px 0 0 20px;
}
.todo-form {
  display: flex;
  margin-top: 20px;
  margin-left: 30px;
}
body {
  background: linear-gradient(to right, rgb(113, 65, 168), rgba(44, 114, 251, 1));
}
.todo-app {
  width: 98%;
  height: 500px;
  padding-top: 30px;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 40px;
  margin-left: 1%;
}
.title {
  font-size: 30px;
  font-weight: 700;
  text-align: center;
}
</style>
