<template>
  <header>
    <UserManagement/>
    <h1>Beethoven in the House – Annotator <button v-on:click="goHome" class="btn btn-sm">Home</button></h1>
  </header>
</template>

<script>
import UserManagement from './AppHeader/UserManagement.vue'
export default {
  name: 'AppHeader',
  components: {
    UserManagement
  },
  methods: {
    goHome: function () {
      this.$store.dispatch('setPerspective','landingPage')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
header {
  background-color: #e5e5e5;
  border-bottom: .5px solid #999999;
  padding: .2rem 1rem;

  h1 {
    text-align: left;
    margin: 0;
    font-size: 1.2rem;
  }
}
</style>
