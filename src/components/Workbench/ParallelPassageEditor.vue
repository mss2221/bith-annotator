<template>
  <div class="parallelPassageEditor">
    <h1>Parallel Passage Editor</h1>
    <div class="id">New @id: {{ musMatId }}</div>

    <div class="form-group">
      <label class="form-label" for="ppEditLabel">Label</label>
      <textarea class="form-input" id="ppEditLabel" v-model.trim="parallelLabel" placeholder="Label for Passage(s)" rows="1"></textarea>
    </div>

    <div class="selectionList">
      <label for="linkedPassages">Linked Passages</label>
      <table id="linkedPassages" class="table">
        <tbody>
          <tr v-for="e in currentExtracts">
            <td>Label</td>
          </tr>
        </tbody>
      </table>
      <div class="numberWarning" v-if="currentExtracts.length < 2">You need at least two passages to save a parallel passage.</div>
      <button class="btn btn-link" v-on:click="startSelectionMode">Add Passage</button>
    </div>

    <div class="buttons">
      <button class="btn" v-on:click="cancel">cancel</button>
      <button class="btn btn-primary" v-bind:class="{'disabled': !isReadyToSave}" v-on:click="save">save</button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ParallelPassageEditor',
  components: {

  },
  props: {

  },
  computed: {
    currentAnnot: function() {
      return this.$store.getters.currentAnnot
    },
    musMatId: function() {
      return this.$store.getters.currentMusicalMaterials[0]['@id']
    },
    isReadyToSave: function() {
      return this.$store.getters.currentSelections.length > 1 && this.$store.getters.currentExtracts.length > 1
    },
    currentExtracts: function() {
      return this.$store.getters.currentExtracts
    },
    selectionModeActive: function() {
      return this.$store.getters.selectionModeActive
    },
    parallelLabel: {
      get () {
        return this.$store.getters.currentMusicalMaterials[0]['https://www.w3.org/2000/01/rdf-schema#label']
      },
      set (val) {
        console.log('setting to ' + val)
        let object = this.$store.getters.currentMusicalMaterials[0]
        object['https://www.w3.org/2000/01/rdf-schema#label'] = val
        this.$store.dispatch('changeCurrentDataObject', { type: 'musicalMaterial', object })
      }
    }
  },
  methods: {
    cancel: function() {
      this.$store.dispatch('setEditing', null)
    },
    save: function() {
      console.log('ready to save: ' + this.isReadyToSave)
      console.log('need to trigger an action that pushes the currentAnnot stuff into the regular annotStore')
    },
    startSelectionMode: function() {
      this.$store.dispatch('setSelectable', true)
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.parallelPassageEditor {
  h1 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 .3rem;
    padding: 0;
  }

  .id {
    color: #666666;
    font-family: monospace;
    font-size: .45rem;
  }

  .numberWarning {
    margin: .5rem 0;

    &:before {
      content: 'Hint: ';
    }
  }

  .btn-link {
    padding: 0;
  }

  .buttons {
    text-align: right;

    button.btn-primary {
      margin-left: .2rem;
    }
  }
}
</style>
