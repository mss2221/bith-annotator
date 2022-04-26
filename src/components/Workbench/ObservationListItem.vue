<template>
  <div class="observation" v-on:click="activateObservation">
    <div class="observationId" v-bind:title="'@id:\n' + observationId">@id</div>
    <div class="observationLabel">Observation on <em>{{ label }}</em></div>
  </div>
</template>

<script>

export default {
  name: 'ObservationListItem',
  components: {

  },
  props: {
    observationId: String
  },
  computed: {
    label: function() {
      return this.$store.getters.observationLabel(this.observationId)
      //return this.$store.getters.musicalMaterialLabel(this.musMatId)
    }
  },
  methods: {
    activateObservation: function() {
      try {
        console.log('trying to activate ' + this.observationId)
        this.$store.dispatch('setActiveObservation', this.observationId)
      } catch(err) {
        console.log('errored at ' + this.observationId + ': ' + err)
      }

      try {
        this.$store.dispatch('setEditing','observation')
      } catch(err) {
        console.log('errored at setEditing observation ' + this.observationId + ': ' + err)
      }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.observation {
  cursor: pointer;
  position: relative;

  .observationId {
    position: absolute;
    right: .3rem;
    color: #999999;
    font-family: monospace;
    font-size: .6rem;
  }
}

</style>
