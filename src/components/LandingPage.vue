<template>
  <div class="container">
    <div class="columns">
      <div class="column col-12">
        <p>
          Welcome to the BitH-Annotator prototype. This tool is a proof of
          concept for bridging the gap between Linked Open Data, using the MELD
          framework, and scholarly annotations based on the concepts of Edirom.
        </p>
        <p>
          Some of the functionality of this application depends on a User Account
          with a SolidPOD provider. If you plan to write annotations, you have to
          create a free account. Through the Login button on the top right, you
          can either log in to an existing account or create a new one.
        </p>
        <p>
          <button class="btn btn-primary" v-on:click="showLibrary">Library</button>
        </p>
        <p v-if="isLoggedIn">
          <button class="btn" v-on:click="uploadTest">uploadTest</button>
        </p>
        <!--<p>
          <button class="btn btn-primary" v-on:click="testVerovio">test verovio</button>
        </p>-->
      </div>
    </div>
  </div>
</template>

<script>
import Verovio from './Workbench/Verovio.vue'

export default {
  name: 'LandingPage',
  components: {
    Verovio
  },
  computed: {
    isLoggedIn: function() {
      return this.$store.getters.isLoggedIn
    }
  },
  methods: {
    showLibrary: function () {
      this.$store.dispatch('setPerspective','library')
    },
    uploadTest: function () {
      this.$store.dispatch('uploadTest')
    }/*,
    testVerovio: function() {
      const svg = this.$store.getters.rendering({uri: 'https://raw.githubusercontent.com/DomesticBeethoven/data/main/mei/op.%2092/KlaviertrioSteiner%20-%20D-BNba%20C92_30/D-BNbaC92_30.2nd.mei', settings: 'fullScore'})
      console.log(svg)
    }*/
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.container {
  padding: 1rem 2rem;
}
</style>
