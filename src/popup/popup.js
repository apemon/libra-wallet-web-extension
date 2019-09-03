import 'buefy/dist/buefy.min.css'
import Vue from 'vue'
import App from './App.vue'
import router from './router'

import Buefy from 'buefy'
import VueLoading from 'vue-loading-template'

Vue.use(Buefy, {
  defaultIconPack: 'fas'
})
Vue.use(VueLoading)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
