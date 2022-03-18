<template>
  <div class="musmat" v-on:click="activateMusmat">
    <div class="musmatId" v-bind:title="'@id:\n' + musmat['@id']">@id</div>
    <div class="musmatLabel">{{musmat['https://www.w3.org/2000/01/rdf-schema#label']}}</div>
  </div>
</template>

<script>

export default {
  name: 'MusMatListItem',
  components: {

  },
  props: {
    musmat: Object
  },
  computed: {
    /*currentAnnot: function() {
      return this.$store.getters.currentAnnot
    },*/
  },
  methods: {
    activateMusmat: function() {
      console.log('hello')
      console.log(this.musmat['@id'])
      this.$store.dispatch('setActiveMusMat', this.musmat['@id'])
      console.log(2)
      this.$store.dispatch('setEditing','parallelPassage')
      console.log(3)
    }
    /*cancel: function() {
      this.$store.dispatch('setEditing', null)
    },
    save: function() {
      console.log('ready to save: ' + this.isReadyToSave)
      console.log('need to trigger an action that pushes the currentAnnot stuff into the regular annotStore')
    },
    startSelectionMode: function() {
      this.$store.dispatch('setSelectionModeActive', true)
      this.$store.dispatch('addPassage')
    }*/
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.musmat {
  cursor: pointer;
  position: relative;

  .musmatId {
    position: absolute;
    right: .3rem;
    color: #999999;
    font-family: monospace;
    font-size: .6rem;
  }
}

</style>
