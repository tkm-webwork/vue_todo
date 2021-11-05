import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  // アプリケーションの状態、情報
  state: {
    todos: [],
    todoFilter: '',
    targetTodo: {
      id: null,
      title: '',
      detail: '',
      completed: '',
    },
    // 内容を空にして状況に応じて切り替えるようにするために文字を削除
    errorMessage: '',
    emptyMessage: '',
  },
  // getter:stateの一部やstateから返された値を保持する
  getters: {
    completedTodos: state => state.todos.filter(todo => todo.completed),
    incompleteTodos: state => state.todos.filter(todo => !todo.completed),
    // 以下２つはfooter部分で使用している
    completedTodosLength: (state, getters) => getters.completedTodos.length,
    incompleteTodosLength: (state, getters) => getters.incompleteTodos.length,
  },
  // stateを変化させる
  // 原則として、mutation以外でstateの更新を行うことは禁止
  // stateの状態がいつどこで発生したのかを追跡しやすくするため
  mutations: {
    setTodoFilter(state, routeName) {
      state.todoFilter = routeName;
    },
    // 変数定義だったのでstateのemptyMessageを変更するように修正
    setEmptyMessage(state, routeName) {
      if (routeName === 'completedTodos') {
        state.emptyMessage = '完了済みのやることリストはありません。';
      } else if (routeName === 'incompleteTodos') {
        state.emptyMessage = '未完了のやることリストはありません。';
      } else {
        state.emptyMessage = 'やることリストには何も登録されていません。';
      }
    },
    initTargetTodo(state) {
      state.targetTodo = {
        id: null,
        title: '',
        detail: '',
        completed: false,
      };
    },
    hideError(state) {
      // エラー文を空にする処理なので文字列を消して空に修正
      state.errorMessage = '';
    },
    showError(state, payload) {
      // 定数に代入するようになっていたのでstateのerrorMessageが書き換わるように修正
      if (payload) {
        state.errorMessage = payload.data;
      } else {
        state.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
      }
    },
    updateTargetTodo(state, { name, value }) {
      state.targetTodo[name] = value;
    },
    getTodos(state, payload) {
      state.todos = payload.reverse();
    },
    addTodo(state, payload) {
      state.todos.unshift(payload);
    },
    showEditor(state, payload) {
      state.targetTodo = Object.assign({}, payload);
    },
    editTodo(state, payload) {
      state.todos = state.todos.map((todoItem) => {
        if (todoItem.id === payload.id) return payload;
        return todoItem;
      });
    },
  },
  // 非同期通信や外部APIとのやりとりを行う
  actions: {
    setTodoFilter({ commit }, routeName) {
      commit('setTodoFilter', routeName);
    },
    setEmptyMessage({ commit }, routeName) {
      commit('setEmptyMessage', routeName);
    },
    updateTargetTodo({ commit }, { name, value }) {
      commit('updateTargetTodo', { name, value });
    },
    getTodos({ commit }) {
      axios.get('http://localhost:3000/api/todos/').then(({ data }) => {
        commit('getTodos', data.todos);
        // mutations内のhideErrorを実行
        commit('hideError');
      }).catch((err) => {
        commit('showError', err.response);
      });
    },
    addTodo({ commit, state }) {
      if (!state.targetTodo.title || !state.targetTodo.detail) {
        commit({
          type: 'showError',
          data: 'タイトルと内容はどちらも必須項目です。',
        });
        return;
      }
      const postTodo = Object.assign({}, {
        title: state.targetTodo.title,
        detail: state.targetTodo.detail,
      });
      axios.post('http://localhost:3000/api/todos/', postTodo).then(({ data }) => {
        commit('addTodo', data);
        // mutations内のhideErrorを実行
        commit('hideError');
      }).catch((err) => {
        commit('showError', err.response);
      });
      commit('initTargetTodo');
    },
    changeCompleted({ commit }, todo) {
      const targetTodo = Object.assign({}, todo);
      axios.patch(`http://localhost:3000/api/todos/${targetTodo.id}`, {
        completed: !targetTodo.completed,
      }).then(({ data }) => {
        commit('editTodo', data);
        // mutations内のhideErrorを実行
        commit('hideError');
      }).catch((err) => {
        commit('showError', err.response);
      });
      commit('initTargetTodo');
    },
    showEditor({ commit }, todo) {
      commit('showEditor', todo);
    },
    editTodo({ commit, state }) {
      const targetTodo = state.todos.find(todo => todo.id === state.targetTodo.id);
      if (
        targetTodo.title === state.targetTodo.title
        && targetTodo.detail === state.targetTodo.detail
      ) {
        commit('initTargetTodo');
        return;
      }
      axios.patch(`http://localhost:3000/api/todos/${state.targetTodo.id}`, {
        title: state.targetTodo.title,
        detail: state.targetTodo.detail,
      }).then(({ data }) => {
        commit('editTodo', data);
        // mutations内のhideErrorを実行
        commit('hideError');
      }).catch((err) => {
        commit('showError', err.response);
      });
      commit('initTargetTodo');
    },
    // 通常のパターン
    // deleteTodo({ commit }, todoId) {
    //   axios.delete(`http://localhost:3000/api/todos/${todoId}`).then(({ data }) => {
    //     // 処理
    //     commit('getTodos', data.todos);
    //     commit('hideError');
    //   }).catch((err) => {
    //     // 処理
    //     commit('showError', err.response);
    //   });
    //   // 必要があれば処理
    //   commit('initTargetTodo');
    // },
    // Promiseを使用したパターン
    deleteTodo({ commit }, todoId) {
      return new Promise((resolve) => {
        axios.delete(`http://localhost:3000/api/todos/${todoId}`).then(() => {
          // 処理
          // ListItemで記述したthen以降の内容を実行することが出来る。
          resolve();
          commit('hideError');
        }).catch((err) => {
          // 処理
          commit('showError', err.response);
          // 今回はcatch()をListItemで記述していないので省略
          // reject();
        });
        commit('initTargetTodo');
      });
    },
  },
});

export default store;
