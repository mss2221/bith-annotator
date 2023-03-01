<template>
  <div id="landingPage">
    <p>Welcome to the BitH-Annotator prototype. This tool is a proof of concept
      for bridging the gap between Linked Open Data, using the <a href="https://meld.web.ox.ac.uk/" target="_blank" rel="nofollow, noreferrer, noopener">MELD framework</a>,
      and scholarly annotations based on the concepts of <a href="https://edirom.de" target="_blank" rel="noreferrer, nofollow, noopener">Edirom</a>.</p>

    <p>Some of the functionality of this application depends on a User Account
      with a SolidPOD provider. If you plan to write annotations, you have to
      create a free account. Through the Login button on the top right, you can
      either log in to an existing account or create a new one. For the time
      being, we assume you have an account from
      <a href="https://solidcommunity.net/" target="_blank" rel="noreferrer, nofollow, noopener">SolidCommunity.net</a>.</p>
      <!-- The reason for this assumption is baked into UserManagement.vue -->
    <p>Open the App with the following button:</p>
    <button id="start" @click="startApp" class="btn btn-primary">Annotator</button>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  components: {

  },
  computed: {

  },
  methods: {
    startApp: function () {
      this.$store.dispatch('toggleLandingPage')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

#landingPage {
  position: absolute;
  top: $appHeaderHeight;
  right: 0;
  bottom: $appFooterHeight;
  left: 0;

  overflow: scroll;

  background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), lighten($mainBackgroundColor, 5%));
  padding: 1rem;
  font-weight: 300;

  a {
    font-weight: 500;
  }

  #start {
    margin: 0 auto;
    display: block;
  }
}

</style>
