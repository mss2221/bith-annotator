<template>
  <div class="annotatorBox">
      <template v-if="!isEditing">
        <h1>Annotator</h1>
        <ul class="tab">
          <li class="tab-item" v-bind:class="{'active': tab === 'parallelPassages'}">
            <a href="#" v-on:click="setTab('parallelPassages')">Parallel Passages</a>
          </li>
          <li class="tab-item" v-bind:class="{'active': tab === 'observations'}">
            <a href="#" v-on:click="setTab('observations')">Observations</a>
          </li>
        </ul>

        <template v-if="tab === 'parallelPassages'">
          <div class="content">
            <table class="table narrow">
              <tbody>
                <tr v-for="m in musicalMaterials">
                  <td>{{ m['https://www.w3.org/2000/01/rdf-schema#label'] }}</td>
                </tr>
                <tr>
                  <td>
                    <button v-on:click="setEditing('parallelPassage')" class="btn btn-link"><i class="icon icon-plus"></i>
   Identify new Parallel Passage</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template v-if="tab === 'observations'">
          <div class="content">
            Observations: {{observations.length}}
          </div>
        </template>
      </template>
      <template v-else>
        <ParallelPassageEditor v-if="editMode === 'parallelPassage'"/>
      </template>

  </div>
</template>

<script>

import ParallelPassageEditor from './ParallelPassageEditor.vue'

export default {
  name: 'AnnotatorTool',
  components: {
    ParallelPassageEditor
  },
  methods: {
    setTab: function(which) {
      this.tab = which
    },
    setEditing: function(mode) {
      this.$store.dispatch('setEditing', mode)
    }
  },
  data: function() {
    return {
      tab: 'parallelPassages'
    }
  },
  computed: {
    observations: function() {
      return this.$store.getters.observations
    },
    musicalMaterials: function() {
      return this.$store.getters.musicalMaterials
    },
    isEditing: function() {
      return this.$store.getters.isEditing
    },
    editMode: function() {
      return this.$store.getters.editMode
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.annotatorBox {
  text-align: left;
  padding: .3rem;

  h1 {
    font-size: 1rem;
    font-weight: bold;
    margin: 0 0 .2rem;
    padding: 0;
  }

  table.narrow {
    td {
      padding: .2rem;
      button {
        padding: 0;
        height: unset;
      }
    }
  }
}
</style>
