<template>
  <div class="extract" v-bind:class="{'active': extractId === extract['@id']}" v-on:click="activateExtract">
    <div class="extractLabel"><div class="extractId" v-bind:title="'Prospective @id:\n' + extract['@id']">@id</div>Passage</div>
    <textarea class="form-input" v-model.trim="extractLabel" v-bind:placeholder="'Label for ' + typeLabel" rows="1"></textarea>

  </div>
</template>

<script>

export default {
  name: 'ExtractListItem',
  components: {

  },
  props: {
    extract: Object,
    typeLabel: String
  },
  computed: {
    currentAnnot: function() {
      return this.$store.getters.currentAnnot
    },
    extractId: function() {
      return this.$store.getters.activeExtract
    },
    extractLabel: {
      get () {
        return this.$store.getters.workingExtract(this.extract['@id'])['https://www.w3.org/2000/01/rdf-schema#label']
      },
      set (val) {
        let object = this.$store.getters.workingExtract(this.extract['@id'])
        object['https://www.w3.org/2000/01/rdf-schema#label'] = val
        this.$store.dispatch('changeCurrentDataObject', { type: 'extract', object })
      }
    }
  },
  methods: {
    activateExtract: function() {
      this.$store.dispatch('setActivePassage', this.extract['@id'])
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

.extract {
  border: .5px solid #999999;
  border-radius: .2rem;
  background-color: #f5f5f5;
  padding: .2rem .3rem;
  margin: 0 0 .6rem 1rem;
  position: relative;

  &.active {
    background-color: #0f83ff24;
  }

  .extractId {
    position: absolute;
    right: .3rem;
    color: #999999;
    font-family: monospace;
    font-size: .6rem;
  }

}

</style>
