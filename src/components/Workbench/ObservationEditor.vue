<template>
  <div class="observationEditor">
    <h1>Observation Editor</h1>

    <div class="id">@id: {{ observationId }}</div>

    <div class="form-group">
      <label class="form-label" for="obEditBody">Observation</label>
      <textarea class="form-input" id="obEditBody" v-model.trim="body" placeholder="Enter your observation" rows="5"></textarea>
    </div>

    <div class="musMatList">
      <label for="linkedPassages">Observation on (select <u>one</u> musical material):</label>
      <div v-for="m in musMats">
        <MusMatListItemSelector v-bind:musMatId="m"/>
      </div>
    </div>

    <div class="buttons">
      <button class="btn" v-on:click="cancel">cancel</button>
      <button class="btn btn-primary" v-bind:class="{'disabled': !isReadyToSave}" v-on:click="save">save</button>
    </div>

    <!--<div class="id">New @id: {{ musMatId }}</div>

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
    </div>-->
  </div>
</template>

<script>
import MusMatListItemSelector from './MusMatListItemSelector.vue'
import { prefix as pref } from './../../meld/prefixes'

export default {
  name: 'ObservationEditor',
  components: {
    MusMatListItemSelector
  },
  props: {

  },
  computed: {
    currentAnnot: function() {
      return this.$store.getters.currentAnnot
    },
    observationId: function() {
      return this.$store.getters.currentObservationId
    },
    body: {
      get () {
        const body = this.$store.getters.currentObservationBody
        return body
      },
      set (val) {

        this.$store.dispatch('changeCurrentDataObject', {
          type: 'observation',
          id: this.$store.getters.currentObservationId,
          prop: pref.oa + 'bodyValue',
          method: 'setStringNoLocale',
          val
        })
      }

    },
    isReadyToSave: function() {
      return true
      //return this.$store.getters.currentExtracts.length > 1 && this.$store.getters.currentSelections.length > 1
    },
    musMats: function() {
      return this.$store.getters.musicalMaterialIDs
    }
    /*

    isReadyToSave: function() {
      return this.$store.getters.currentExtracts.length > 1 && this.$store.getters.currentSelections.length > 1
    },
    currentExtracts: function() {
      return this.$store.getters.currentExtracts
    },
    selectionModeActive: function() {
      return this.$store.getters.selectionModeActive
    },

    */
  },
  methods: {
    cancel: function() {
      this.$store.dispatch('setEditing', null)
    },
    save: function() {
      if(this.isReadyToSave) {
        this.$store.dispatch('saveCurrentAnnot')
      }
    }
    /*,

    startSelectionMode: function() {
      this.$store.dispatch('setSelectionModeActive', true)
      this.$store.dispatch('addPassage')
    }*/
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.observationEditor {
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
