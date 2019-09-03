import Vue from 'vue';
import Router from 'vue-router';
import WalletView from './views/Wallet'
import ReceiveView from './views/Receive'
import SendView from './views/Send'

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'wallet',
      component: WalletView
    },{
      path: '/receive',
      name: 'receive',
      component: ReceiveView
    },{
      path: '/send',
      name: 'send',
      component: SendView
    }
  ],
});
