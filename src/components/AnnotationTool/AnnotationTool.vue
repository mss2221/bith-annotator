<template>
  <div class="outer">
    <Splitpanes horizontal class="default-theme">
      <PreviewPane v-for="(item, i) in previewItems" :key="i" :index="i" :obj="item"/>
    </Splitpanes>
  </div>
</template>

<script>
// import GraphEntry from '@/components/OverviewTool/GraphEntry.vue'
// import GraphEntryDetailed from '@/components/OverviewTool/GraphEntryDetailed.vue'
import PreviewPane from '@/components/AnnotationTool/PreviewPane.vue'

import { Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

// eslint-disable-next-line
import { bithTypes } from '@/meld/constants.js'

export default {
  name: 'AnnotationTool',
  components: {
    Splitpanes,
    PreviewPane
  },
  computed: {
    bithTypes: function () {
      return bithTypes
    },
    views: function () {
      return this.$store.getters.views
    },
    affected: function () {
      return this.$store.getters.affectedByActiveAnnot
    },
    previewItems: function () {
      return this.$store.getters.previewItems
    }
  },
  methods: {
    newObservation: function () {
      this.$store.dispatch('addObservation')
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

    .addThing {
      font-size: .6rem;
      cursor: pointer;
    }
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

.annotPanes {
  .splitpanes__pane {
    background-color: #ffffff;
  }
}

.scrollBox {
  overflow: scroll;
  height: 100%;
  flex-grow: 1;
  padding: 0 .5rem .5rem .5rem;

  .solidBox {
    margin: 0.5rem 0 0 0;
  }
}

</style>
