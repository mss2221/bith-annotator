<template>
  <div id="app">
    <AppHeader/>
      <splitpanes vertical class="default-theme">
        <pane size="70">
          <LandingPage v-if="showLandingPage"/>
          <Library v-if="showLibrary"/>
          <Workbench v-if="showWorkbench"/>
        </pane>
        <pane size="30">
          <splitpanes horizontal style="height: 600px" class="default-theme">
            <pane size="10">
              <p>SIDEBAR</p>
            </pane>
            <pane size="45">
              <p>PREVIEW: upper pane</p>
            </pane>
            <pane size="45">
              <p>PREVIEW: lower pane</p>
            </pane>
          </splitpanes>
        </pane>
      </splitpanes>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import LandingPage from './components/LandingPage.vue'
import Library from './components/Library.vue'
import Workbench from './components/Workbench.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css';

export default {
  name: 'App',
  components: {
    AppHeader,
    Library,
    LandingPage,
    Workbench,
    Splitpanes,
    Pane
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
.splitpanes {


}
</style>
