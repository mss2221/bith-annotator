<template>
  <div class="userBox float-right">
    <div class="login" v-on:click="userLogin">
      <i class="icon icon-people"></i>
      {{ buttonLabel }}
    </div>
    <div class="username">
      <a v-if="isLoggedIn" v-bind:href="webId" target="_blank" rel="noopener noreferrer">{{ username }}</a>
    </div>
    <!--<div class="test" v-on:click="testUpload">Test</div>-->

  </div>
</template>

<script>
// SolidPOD authentication library

import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch
} from "@inrupt/solid-client-authn-browser"

import {
  createSolidDataset,
  getSolidDataset,
  saveSolidDatasetAt,
  getThing,
  getFile,
  isRawData,
  isThing,
  createThing,
  getContentType,
  getSourceUrl,
  overwriteFile,
  getStringNoLocale //,
  // getUrlAll
} from '@inrupt/solid-client'

import * as jsonld from 'jsonld'
const $rdf = require('rdflib')

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
    /*
    async userLogin() {
      await login({
        oidcIssuer: "https://broker.pod.inrupt.com",
        redirectUrl: window.location.href,
        clientName: "BitH Annotator"
      })
    }
    */
    async userLogin() {
      const idp = 'https://solidcommunity.net'
      await login({
        oidcIssuer: idp,
        redirectUrl: window.location.href,
        clientName: 'rdflib test'
      })
    }

    /*async testUpload () {
      console.log('testUpload starting')
      const targetId = 'https://kepper.solidcommunity.net/private/target.jsonld'

      const data = {
        "@id": targetId,
        "@type": ["http://www.w3.org/ns/ldp#Container"],
        "http://www.w3.org/ns/ldp#contains": []
      }

      const nquads = await jsonld.toRDF(data, {format: 'application/n-quads'})
      console.log('nquads:', nquads)

      const ds = createSolidDataset()
      console.log(ds)

      const kb = $rdf.graph()
      console.log('$rdf')
      console.log($rdf.jsonParser.parseJSON(data, 'http://no.where', kb))
      console.log('hello')

      console.log(isThing)
      console.log(isThing(nquads))

      // For example, the user must be someone with Write access to the specified URL.
      const savedSolidDataset = await saveSolidDatasetAt(
        targetId,
        nquads, {
          fetch: window.solidFetcher
        })

      console.log('success', savedSolidDataset)

    }*/

  },
  created: function () {

    // console.log('LOGIN TEST')
    // console.log($rdf)

    const idp = 'https://solidcommunity.net'
    // const privateResource = 'https://kepper.solidcommunity.net/private/testThing.jsonld'
    // const auth = solidClientAuthentication
    async function main(session){
        console.log('starting with main')
        const kb = $rdf.graph()
        window.solidFetcher = session.fetch
        const fetcher = $rdf.fetcher(kb)
        /*try {
          fetcher.load(privateResource).then(res => {
            const nq = res.responseText
            return nq
          }).then(json => {
            //const j = jsonld.fromRDF(nq, {format: 'application/n-quads'})
            //console.log(j)
          })

        }
        catch(e) { console.log(e) }
        */

        /*const sampleData = {
          "@id": "https://BithUser.inrupt.net/private/bith/82629079-0bee-4172-92fc-6f9a1160",
          "@type": ["http://www.w3.org/ns/ldp#Container"],
          "http://www.w3.org/ns/ldp#contains": [
            {"@id": "https://https://BithUser.inrupt.net/private/bith/6c9cfd13-f013-405a-afff-8beff8669a24.jsonld"},
            {"@id": "https://BithUser.inrupt.net/private/bith/6c9cfd13-f013-405a-afff-8beff8669a24.jsonld"},
            {"@id": "https://BithUser.inrupt.net/private/bith/022b543d-809d-4ecd-aa06-0dbcb21a8032.jsonld"},
            {"@id": "https://BithUser.inrupt.net/private/bith/92dc6206-45e4-48e3-b820-f82ca6766131.jsonld"}]
        }

        const nquads = await jsonld.toRDF(sampleData, {format: 'application/n-quads'})
        */
    }

    const handleRedirectAfterLogin = async () => {
        await handleIncomingRedirect({restorePreviousSession: true})
        let session = getDefaultSession()
        if (session.info.isLoggedIn) {
          this.$store.dispatch('setSolidSession', session)
          main(session)
        }
    }
    handleRedirectAfterLogin()


    /*
    handleIncomingRedirect({restorePreviousSession: true})

      .then(info => {
        console.log('logged in as ' + info.webId, info)
        const session = getDefaultSession()
        this.$store.dispatch('setSolidSession', session)
      })
    */
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
