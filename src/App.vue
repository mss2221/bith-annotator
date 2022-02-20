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

// SolidPOD authentication library
import auth from 'solid-auth-client'


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
  created: function () {
    // check for session
    auth.trackSession(session => {
      if (!session) {
        console.info('The user is not logged in')
        async function popupLogin() {
          let session = await auth.currentSession()
          let popupUri = 'http://localhost:8080/auth-popup.html'
          if (!session) {
            session = await auth.popupLogin({ popupUri })
          }
          this.$store.dispatch('setSolidSession', session)

          console.log('Logged in as ' + session.webId)
        }
        popupLogin();
      }
      else {
        console.info('The user is ' + session.webId)
        this.$store.dispatch('setSolidSession', session)
      }
    })
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
