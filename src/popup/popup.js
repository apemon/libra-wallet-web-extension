import Vue from 'vue'
import App from './App.vue'
import router from './router'

import Buefy from 'buefy'

import 'buefy/dist/buefy.min.css'

Vue.use(Buefy, {
  defaultIconPack: 'fas'
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
