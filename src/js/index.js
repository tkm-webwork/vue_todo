import Vue from 'vue';
import VueRouter from 'vue-router';

// import routes from 'TodoRouterDir/routes';
import routes from 'TodoVuexDir/routes';
// ここでstoreを読み込んでいる
import store from 'TodoVuexDir/store';
// import routes from 'VuexSample/routes';
// import store from 'VuexSample/store';

import '../scss/global.scss';

// import myApp from './first';
// import myApp from 'TodoDir';
// import myApp from 'TodoRouterDir';
import myApp from 'TodoVuexDir';
// import myApp from 'VuexSample';

Vue.use(VueRouter);
const router = new VueRouter({
  // 多分これは短縮表記
  routes,
  mode: 'history',
});

new Vue({
  // elにマウントするhtml要素を指定する
  el: '#app',
  router,
  // ここでstoreとVueを連携している
  store,
  render: h => h(myApp),
  // render: h => h(myApp), は↓の書き方を短くしたもの
  // render: function (createElement) {
  //   return createElement(myApp)
  // }
});
