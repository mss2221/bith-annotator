<template>
  <div class="userBox float-right">
    <div class="login">
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
import auth from 'solid-auth-client'

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
        return this.$store.getters.solidSession.webId
      } else {
        return '#'
      }

    }
  },
  created: function () {
    /*
    // These events are only necessary for logging out functionality…
    auth.addListener('login', (session) => {
      console.log('user logged in:')
      console.log(session)
    })

    auth.addListener('logout', () => {
      console.log('user logged out')
    })

    auth.addListener('session', (session) => {
      console.log('session event: ' + typeof session)
    })
    */
    // check for session

    // todo: this code needs to move to the button
    auth.trackSession(session => {
      if (!session) {
        // console.info('The user is not logged in')
        async function popupLogin() {
          let session = await auth.currentSession()
          let popupUri = 'http://localhost:8080/auth-popup.html'
          if (!session) {
            session = await auth.popupLogin({ popupUri })
          }
          this.$store.dispatch('setSolidSession', session)
        }
        popupLogin();
      }
      else {
        // console.info('The user is ' + session.webId)
        this.$store.dispatch('setSolidSession', session)
      }
    })
  },
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
