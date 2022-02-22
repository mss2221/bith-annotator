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
  getDefaultSession,
  fetch
} from "@inrupt/solid-client-authn-browser";

// Import from "@inrupt/solid-client"
/*import {
  getSolidDataset,
  saveSolidDatasetAt,
  getThing,
  getStringNoLocale,
  getUrlAll
} from "@inrupt/solid-client";*/


export default {
  name: 'UserManagement',
  computed: {
    username: function() {
      return this.$store.getters.solidUser
    },
    isLoggedIn: function() {
      return this.$store.getters.isLoggedIn
    },
    buttonLabel: function() {
      return this.$store.getters.isLoggedIn ? 'Logout' : 'Login'
    },
    webId: function() {
      if (this.$store.getters.solidSession !== null) {
        return this.$store.getters.solidSession.info.webId
      } else {
        return '#'
      }
    }
  },
  methods: {
    async userLogin() {
      await login({
        oidcIssuer: "https://broker.pod.inrupt.com",
        redirectUrl: window.location.href,
        clientName: "BitH Annotator"
      })
    }
  },
  created: function () {

    handleIncomingRedirect({restorePreviousSession: true})
      .then(info => {
        console.log('logged in as ' + info.webId, info)
        const session = getDefaultSession()
        this.$store.dispatch('setSolidSession', session)
      })
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
