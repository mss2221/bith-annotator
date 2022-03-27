<template>
  <div class="musmat" v-on:click="activateMusmat">
    <div class="musmatId" v-bind:title="'@id:\n' + musMatId">@id</div>
    <div class="musmatLabel">{{ label }}</div>
  </div>
</template>

<script>

export default {
  name: 'MusMatListItem',
  components: {

  },
  props: {
    musMatId: String
  },
  computed: {
    label: function() {
      return this.$store.getters.musicalMaterialLabel(this.musMatId)
    }
    /*currentAnnot: function() {
      return this.$store.getters.currentAnnot
    },*/
  },
  methods: {
    activateMusmat: function() {
      console.log(1)
      try {
        this.$store.dispatch('setActiveMusMat', this.musMatId)
      } catch(err) {
        console.log('errored at ' + this.musMatId + ': ' + err)
      }

      console.log(2)
      try {
        this.$store.dispatch('setEditing','parallelPassage')
      } catch(err) {
        console.log('errored at setEditing parallelPassage ' + this.musMatId + ': ' + err)
      }
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
