<template>
  <div class="hello">
    <h1>Beethoven in the House – Annotator Prototype</h1>
    <div>
      <p>Welcome to BitH-Annotator.</p>
      <button v-on:click="showLibrary">Library</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  methods: {
    showLibrary: function () {
      this.$store.dispatch('setPerspective','library')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
