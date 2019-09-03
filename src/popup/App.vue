<template>
  <div id="app">
    <div>
      <img
        :src="getImagePath('logo.png')"
        class="header-image"
      >
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  mounted() {
    this.$router.push({name:'wallet'})
  },
  methods: {
      getImagePath(img) {
        return chrome.extension.getURL('popup/assets/img/' + img)
      }
  }
}
</script>
<style lang="css">
body {
  width: 360px;
  height: 600px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.header-image {
  width: 50%;
}
.wallet-button {
    font-size: 18px;
    margin: 0px 10px;
}
</style>


