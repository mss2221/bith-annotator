<template>
  <div class="parallelPassageEditor">
    <h1>Parallel Passage Editor</h1>
    <div class="id">New @id: {{ musMatId }}</div>

    <div class="form-group">
      <label class="form-label" for="ppEditLabel">Label for Parallel Passage</label>
      <textarea class="form-input" id="ppEditLabel" v-model.trim="parallelLabel" placeholder="Label for Parallel Passage" rows="1"></textarea>
    </div>

    <div class="selectionList">
      <label for="linkedPassages">Linked Passages</label>
      <div class="numberWarning" v-if="currentExtracts.length < 2">You need at least two passages to save a <em>parallel passage</em>.</div>
      <ExtractListItem v-for="e in currentExtracts" v-bind:extractId="e" v-bind:typeLabel="'single Passage'"/>
      <button class="btn btn-link" v-on:click="startSelectionMode">Add Passage</button>
    </div>

    <div class="buttons">
      <button class="btn" v-on:click="cancel">cancel</button>
      <button class="btn btn-primary" v-bind:class="{'disabled': !isReadyToSave}" v-on:click="save">save</button>
    </div>
  </div>
</template>

<script>
import ExtractListItem from './ExtractListItem.vue'
import { prefix as pref } from './../../meld/prefixes'

export default {
  name: 'ParallelPassageEditor',
  components: {
    ExtractListItem
  },
  props: {

  },
  computed: {
    currentAnnot: function() {
      return this.$store.getters.currentAnnot
    },
    musMatId: function() {
      return this.$store.getters.currentMusicalMaterialId
    },
    isReadyToSave: function() {
      return this.$store.getters.currentExtracts.length > 1 && this.$store.getters.currentSelections.length > 1
    },
    currentExtracts: function() {
      return this.$store.getters.currentExtracts
    },
    selectionModeActive: function() {
      return this.$store.getters.selectionModeActive
    },
    parallelLabel: {
      get () {
        const label = this.$store.getters.currentMusicalMaterialLabel
        return label
      },
      set (val) {
        // console.log('setting to ' + val)
        /*let object = this.$store.getters.currentMusicalMaterials[0]
        object['https://www.w3.org/2000/01/rdf-schema#label'] = val
        this.$store.dispatch('changeCurrentDataObject', { type: 'musicalMaterial', object })
*/
        this.$store.dispatch('changeCurrentDataObject', {
          type: 'musicalMaterial',
          id: this.$store.getters.currentMusicalMaterialId,
          prop: pref.rdfs + 'label',
          method: 'setStringNoLocale',
          val
        })
      }

/*

get () {
  const label = this.$store.getters.workingExtractLabel(this.extractId)
  console.log('label for current extract: ', label)
  return label
},
set (val) {
  this.$store.dispatch('changeCurrentDataObject', { type: 'extract', id: this.extractId, prop: pref.rdfs + 'label', method: 'addStringNoLocale', val })
}

 */

    }
  },
  methods: {
    cancel: function() {
      this.$store.dispatch('setEditing', null)
    },
    save: function() {
      if(this.isReadyToSave) {
        this.$store.dispatch('saveCurrentAnnot')
      }
    },
    startSelectionMode: function() {
      this.$store.dispatch('setSelectionModeActive', true)
      this.$store.dispatch('addPassage')
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
