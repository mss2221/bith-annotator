<template>
  <div id="app">
    <AppHeader/>
    <LandingPage v-if="showLandingPage"/>
    <Library v-if="showLibrary"/>
    <Workbench v-if="showWorkbench"/>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import LandingPage from './components/LandingPage.vue'
import Library from './components/Library.vue'
import Workbench from './components/Workbench.vue'
//import { Splitpanes, Pane } from 'splitpanes'

export default {
  name: 'App',
  components: {
    AppHeader,
    Library,
    LandingPage,
    Workbench
    //Splitpanes,
    //Pane
  },
  computed: {
    showLandingPage: function() {
      return this.$store.getters.showLandingPage
    },
    showLibrary: function() {
      return this.$store.getters.showLibrary
    },
    showWorkbench: function() {
      return this.$store.getters.showWorkbench
    }
  },
  created: function () {
    this.$store.dispatch('initMeld')
    this.$store.dispatch('setTraversalObjectives')
    this.$store.dispatch('traverseGraph')
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
