<template>
  <div class="musmat" v-bind:class="{'active': active}" v-on:click="selectMusmat">
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
    },
    active: function() {
      return this.musMatId === this.$store.getters.currentMusicalMaterialId
    }
    /*currentAnnot: function() {
      return this.$store.getters.currentAnnot
    },*/
  },
  methods: {
    selectMusmat: function() {
      console.log('now I need to try to activate this one… ' + this.musMatId)

      try {
        this.$store.dispatch('setObservationTarget', this.musMatId)
      } catch(err) {
        console.log('errored at ' + this.musMatId + ': ' + err)
      }

      /*try {
        this.$store.dispatch('setActiveMusMat', this.musMatId)
      } catch(err) {
        console.log('errored at ' + this.musMatId + ': ' + err)
      }

      console.log(2)
      try {
        this.$store.dispatch('setEditing','parallelPassage')
      } catch(err) {
        console.log('errored at setEditing parallelPassage ' + this.musMatId + ': ' + err)
      }*/
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
  margin: 0 0 .3rem .6rem;
  padding: .1rem .2rem;

  &.active {
    font-weight: bold;
    background-color: #e5e5e5;
    border: .5px solid #cccccc;
    border-radius: .2rem;
  }

  .musmatId {
    position: absolute;
    right: .3rem;
    top: .25rem;
    color: #999999;
    font-family: monospace;
    font-size: .6rem;
  }
}

</style>
