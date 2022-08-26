<template>
  <div class="outer">
    <div class="modeBlock">
      <h1>Annotator Mode</h1>
      <div class="modeButtons btn-group btn-group-block">
        <button :class="{'btn-primary': !showAnnotationTool}" @click="select" class="btn btn-sm">select</button>
        <button :class="{'btn-primary': showAnnotationTool}" @click="annotate" class="btn btn-sm">annotate</button>
      </div>
    </div>
    <div class="scrollBox">

      <template v-if="!showAnnotationTool">
        <h1>Extracts on current Arrangements:</h1>

        <button class="btn btn-link" @click="newExtract">New Extract</button>
        <div class="solidBox">
          <div class="scrollable">
            <GraphEntry v-for="(e, eI) in viewedExtracts" :key="eI" :file="e" :level="1" :type="bithTypes.extract"/>
          </div>
        </div>

      </template>

      <template v-else>
        <h1>Full Dataset</h1>
        <div class="solidBox">
          <h1>Observations</h1>
          <div class="scrollable">
            <GraphEntry v-for="(o, oI) in observations" :key="oI" v-bind:file="o"/>
          </div>
        </div>

        <div class="solidBox">
          <h1>Musical Materials</h1>
          <div class="scrollable">
            <GraphEntry v-for="(m, mI) in musicalMaterials" :key="mI" v-bind:file="m"/>
          </div>
        </div>

        <div class="solidBox">
          <h1>Extracts</h1>
          <div class="scrollable">
            <GraphEntry v-for="(e, eI) in extracts" :key="eI" v-bind:file="e"/>
          </div>
        </div>

        <div class="solidBox">
          <h1>Selections</h1>
          <div class="scrollable">
            <GraphEntry v-for="(s, sI) in selections" :key="sI" v-bind:file="s"/>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script>
import GraphEntry from '@/components/OverviewTool/GraphEntry.vue'
// eslint-disable-next-line
import { bithTypes } from '@/meld/constants.js'

export default {
  name: 'OverviewTool',
  components: {
    GraphEntry
  },
  computed: {
    bithTypes: function () {
      return bithTypes
    },
    showAnnotationTool: function () {
      return this.$store.getters.annotationToolVisible
    },
    observations: function () {
      return this.$store.getters.allThingsByType(bithTypes.observation)
    },
    musicalMaterials: function () {
      return this.$store.getters.allThingsByType(bithTypes.musicalMaterial)
    },
    extracts: function () {
      return this.$store.getters.allThingsByType(bithTypes.extract)
    },
    viewedExtracts: function () {
      return this.$store.getters.extractsForViewedArrangements
    },
    selections: function () {
      return this.$store.getters.allThingsByType(bithTypes.selection)
    }
  },
  methods: {
    select: function () {
      this.$store.dispatch('setSelectionMode')
    },
    annotate: function () {
      this.$store.dispatch('setAnnotationMode')
    },
    newExtract: function () {
      this.$store.dispatch('addExtract')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.outer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - $appHeaderHeight - $appFooterHeight);
  background-color: #ffffff;

  h1 {
    font-size: 0.8rem;
    font-weight: 500;
  }
}

.modeBlock {
  flex-grow: 0;

  h1 {
    margin: .5rem .5rem .1rem;
  }

  .modeButtons {
    margin: 0 .5rem .5rem;
  }
}

.scrollBox {
  overflow: scroll;
  flex-grow: 1;
  padding: 0 .5rem .5rem .5rem;

  .solidBox {
    margin: 0.5rem 0 0 0;
  }
}

</style>
