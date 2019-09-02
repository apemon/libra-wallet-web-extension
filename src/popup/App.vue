<template>
  <div id="app">
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

.tag {
  cursor: pointer;
}
.label {
  color: white;
  font-size: 24px;
}
.wallet-nav {
    text-align: right;
    padding: 10px;
}
.wallet-form {
    text-align: left;
    padding: 5px 20px;
    color: white;
}
</style>


