import 'buefy/dist/buefy.min.css'
import Vue from 'vue'
import App from './App.vue'
import router from './router'

import Buefy from 'buefy'
import VueLoading from 'vue-loading-template'
import VueClipboard from 'vue-clipboard2'

Vue.use(Buefy, {
  defaultIconPack: 'fas'
})
Vue.use(VueLoading)
Vue.use(VueClipboard)

Vue.config.productionTip = true

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
