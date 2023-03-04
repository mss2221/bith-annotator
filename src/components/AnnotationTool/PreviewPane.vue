<template>
  <Pane class="basicPane">
    <h1>{{ label }}</h1>
    <PreviewFacsimile v-if="obj.type === 'facsimile'" :obj="obj" :index="index"/>
    <PreviewTranscription v-if="obj.type === 'transcription'" :obj="obj" :index="index"/>
  </Pane>
</template>

<script>
import PreviewFacsimile from '@/components/AnnotationTool/PreviewFacsimile.vue'
import PreviewTranscription from '@/components/AnnotationTool/PreviewTranscription.vue'

import { Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

// eslint-disable-next-line
import { bithTypes } from '@/meld/constants.js'

export default {
  name: 'PreviewPane',
  components: {
    Pane,
    PreviewFacsimile,
    PreviewTranscription
  },
  props: {
    obj: Object,
    index: Number
  },
  computed: {
    bithTypes: function () {
      return bithTypes
    },
    label: function () {
      if (this.obj.type === 'facsimile') {
        return this.obj.arrangement.label + ', p.' + (this.obj.pageIndex + 1)
      } else if (this.obj.type === 'transcription') {
        return this.obj.arrangement.label + ', Transcription'
      } else {
        return this.obj.arrangement.label
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';
.basicPane {
  position: relative;
}

h1 {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 0.8rem;
  font-weight: 500;
  padding: .1rem .4rem .2rem;
  background: #ffffff66;
  display: inline-block;
  backdrop-filter: blur(5px);
  border-bottom-right-radius: 5px;
  z-index: 10;
}
</style>
