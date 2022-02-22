<template>
  <div class="userBox float-right">
    <div class="login" v-on:click="login">
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
        return this.$store.getters.solidSession.webId
      } else {
        return '#'
      }
    }
  },
  methods: {
    async login() {

      /*if(this.$store.getters.isLoggedIn) {
        console.log('already logged in')
        return true
      }*/

      await handleIncomingRedirect({restorePreviousSession: false});
      // 2. Start the Login Process if not already logged in.
      if (!getDefaultSession().info.isLoggedIn) {
        /* The `login()` redirects the user to their identity provider;
         i.e., moves the user away from the current page.
         */
        await login({
          // Specify the URL of the user's Solid Identity Provider; e.g., "https://broker.pod.inrupt.com" or "https://inrupt.net"
          // todo: make this selectable
          oidcIssuer: "https://broker.pod.inrupt.com",
          // Specify the URL the Solid Identity Provider should redirect to after the user logs in,
          // e.g., the current page for a single-page app.
          redirectUrl: window.location.href,
          // Pick an application name that will be shown when asked
          // to approve the application's access to the requested data.
          clientName: "BitH Annotator"
        })
      }

      // 3. Make authenticated requests by passing `fetch` to the solid-client functions.
      // The user must have logged in as someone with the appropriate access to the specified URL.
      const session = getDefaultSession()
      this.$store.dispatch('setSolidSession', session)
    }
  },
  created: function () {


    const dispatch = this.$store.dispatch

    /* 1. Call the handleIncomingRedirect() function to complete the authentication process.
       If the page is being loaded after the redirect from the Solid Identity Provider
          (i.e., part of the authentication flow), the user's credentials are stored in-memory, and
          the login process is complete. That is, a session is logged in
          only after it handles the incoming redirect from the Solid Identity Provider.
       If the page is not being loaded after a redirect from the Solid Identity Provider,
          nothing happens.
    */
    async function authenticate() {
      await handleIncomingRedirect({restorePreviousSession: false});
      try {
        const session = getDefaultSession()

        console.log(session)
        // dispatch('setSolidSession', session)
        const loggedIn = session.info.isLoggedIn
        console.log('session is logged in: ', loggedIn)
      } catch(err) {
        console.warn('Authentication Problem: ' + err)
      }

    }

    // authenticate()



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
    /*auth.trackSession(session => {
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
    })*/

    //async function loginAndFetch() {

      /*
      console.log('webId: ' + webId)
      // For example, the user must be someone with Read access to the specified URL.
      const myDataset = await getSolidDataset(
        webId, {
        fetch: authFetch
      });

      console.log(3)
      console.log(myDataset)
      // ...

      const profile = getThing(
        myDataset,
        webId
      );

      console.log(4)
      console.log(profile)

      // 3a. Get a single string data value from the profile.
      // Specifically, the operation returns the profile's FOAF.name
      // (i.e., "http://xmlns.com/foaf/0.1/name") value as a string.
      // Depending on your profile document, the name may be stored under a different identifier.

      const fn = getStringNoLocale(profile, "http://xmlns.com/foaf/0.1/name");

      // 3b. Get multiple URL data from the profile.
      // Specifically , the operation returns the profile's FOAF.knows
      // (i.e., "http://xmlns.com/foaf/0.1/knows") values as an array of URLs.
      // The URLs point to the Things representing Persons.

      const acquaintances = getUrlAll(profile, "http://xmlns.com/foaf/0.1/knows");

      console.log('fn: ' + fn)
      console.log('acquaintances:', acquaintances)


      // For example, the user must be someone with Write access to the specified URL.
      const savedSolidDataset = await saveSolidDatasetAt(
        "https://pod.inrupt.com/kepper/private/test.ttl",
        myDataset, {
        fetch: fetch
      });
      console.log(5)
      console.log(savedSolidDataset)
      */
    //}

    //loginAndFetch()

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
