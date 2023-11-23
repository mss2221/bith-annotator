<template>
  <div class="userBox float-right">
    <div class="login" v-on:click="userLogin">
      <i class="icon icon-people"></i>
      {{ buttonLabel }}
    </div>
    <div class="username">
      <a v-if="isLoggedIn" v-bind:href="webId" target="_blank" rel="noopener noreferrer">{{ username }}</a>
    </div>
  </div>
</template>

<script>
// SolidPOD authentication library

import {
  login,
  handleIncomingRedirect,
  getDefaultSession
} from '@inrupt/solid-client-authn-browser'

const $rdf = require('rdflib')

export default {
  name: 'UserManagement',
  computed: {
    username: function () {
      return this.$store.getters.solidUser
    },
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn
    },
    buttonLabel: function () {
      return this.$store.getters.isLoggedIn ? 'Logout' : 'Login'
    },
    webId: function () {
      if (this.$store.getters.solidSession !== null) {
        return this.$store.getters.solidSession.info.webId
      } else {
        return '#'
      }
    }
  },
  methods: {
    async userLogin () {
      const idp = 'https://solidcommunity.net'
      const params = new URLSearchParams(window.location.search)
      await login({
        oidcIssuer: idp,
        redirectUrl: new URL('/' + params.toString(), window.location.href).toString(), // window.location.href,
        clientName: 'BitH:Annotator'
      })
    }
  },
  created: function () {
    async function main (session) {
      const kb = $rdf.graph()
      window.solidFetcher = session.fetch
      $rdf.fetcher(kb)
    }

    const handleRedirectAfterLogin = async () => {
      await handleIncomingRedirect({ restorePreviousSession: true })
      const session = getDefaultSession()
      if (session.info.isLoggedIn) {
        this.$store.dispatch('setSolidSession', session)
        main(session)
      }
      this.$store.dispatch('setInitialLoading', true)
      this.$store.dispatch('initMeld')
      this.$store.dispatch('setTraversalObjectives')
      this.$store.dispatch('traverseGraph')
    }

    const uriParams = new URLSearchParams(window.location.search)
    const workset = uriParams.get('workset')
    // const code = uriParams.get('code')
    if (workset !== null) {
      sessionStorage.setItem('workset', workset)
    } else {
      console.log('no additional workset requested')
    }

    handleRedirectAfterLogin()

    if (sessionStorage.getItem('workset') !== null) {
      const restoredWorkset = sessionStorage.getItem('workset')
      const newParams = new URLSearchParams(window.location.search)
      newParams.set('workset', restoredWorkset)
      console.log('\n\nNeed to add ' + restoredWorkset)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.userBox {
  font-size: .6rem;
  text-align: right;
  color: #999999;

  .login {
    font-size: .6rem;
    cursor: pointer;
    i {
      margin-right: .3rem;
      position: relative;
      top: -2px;
    }
  }
  .username {
    line-height: 1;
  }
}
</style>
