import Vue from 'vue';
import Router from 'vue-router';
import WalletView from './views/Wallet'

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'wallet',
      component: WalletView
    }
  ],
});
