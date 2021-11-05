<template lang="html">
  <app-wrapper>
    <!-- Naviコンポーネントの追加 -->
    <app-navi />
    <app-register v-if="todoFilter !== 'completedTodos'" />
    <!-- errorMessageがある場合は表示 -->
    <app-error-message
      v-if="errorMessage"
    />
    <template v-slot:todos>
      <app-list v-if="todos.length" :todos="todos" />
      <!-- todosに値がない場合は以下を実行 -->
      <app-empty-message
        v-else
      />
    </template>
  </app-wrapper>
</template>

<script>
import Wrapper from 'TodoVuexDir/components/Wrapper';
import { ErrorMessage, EmptyMessage } from 'TodoVuexDir/components/Message';
import Register from 'TodoVuexDir/components/Register';
import List from 'TodoVuexDir/components/List';
// Naviコンポーネントをインポート
import Navi from 'TodoVuexDir/components/Navi';

export default {
  components: {
    appWrapper: Wrapper,
    appErrorMessage: ErrorMessage,
    appEmptyMessage: EmptyMessage,
    appList: List,
    appRegister: Register,
    appNavi: Navi,
  },
  computed: {
    todoFilter() {
      return this.$store.state.todoFilter;
    },
    todos() {
      if (this.todoFilter === 'allTodos') {
        return this.$store.state.todos;
      }
      return this.$store.getters[this.todoFilter];
    },
    errorMessage() {
      return this.$store.state.errorMessage;
    },
  },
  watch: {
    todos(todos) {
      if (!todos.length) this.$store.dispatch('setEmptyMessage', this.todoFilter);
    },
    $route(to) {
      this.$store.dispatch('setTodoFilter', to.name);
    },
  },
  created() {
    this.$store.dispatch('getTodos');
    this.$store.dispatch('setTodoFilter', this.$route.name);
  },
};
</script>
