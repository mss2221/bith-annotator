<template>
  <template v-if="obj.type === 'facsimile'">
    <Pane class="basicPane">
      <PreviewFacsimile :obj="obj" :index="index"/>
    </Pane>
  </template>
  <template v-else>
    <Pane v-for="(preview, p) in transcriptionPreviews" :key="p" class="basicPane">
      <PreviewTranscription :obj="obj" :index="index" :settings="preview"/>
    </Pane>
    <!--<div v-if="obj.type === 'transcription'">{{transcriptionPreviews}}</div>-->
    <!--<PreviewTranscription v-if="obj.type === 'transcription'" :obj="obj" :index="index"/>-->
  </template>
</template>

<script>
import PreviewFacsimile from '@/components/AnnotationTool/PreviewFacsimile.vue'
import PreviewTranscription from '@/components/AnnotationTool/PreviewTranscription.vue'

import { Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

// eslint-disable-next-line
import { bithTypes } from '@/meld/constants.js'

const parser = new DOMParser()

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
  created: function () {
    this.$store.dispatch('loadMEI', this.obj.fileUri)
  },
  computed: {
    bithTypes: function () {
      return bithTypes
    },
    transcriptionPreviews: function () {
      const previews = []
      if (this.obj.type === 'facsimile') {
        return previews
      }
      const mei = this.$store.getters.mei(this.obj.fileUri)
      if (!mei) {
        return previews
      }
      const meiDom = parser.parseFromString(mei, 'text/xml')

      const partIDs = []
      this.obj.parts.forEach(fullPart => {
        partIDs.push(fullPart.split('#')[1])
      })

      const measures = [...meiDom.querySelectorAll('measure')]
      const arr = []

      partIDs.forEach(target => {
        const elem = meiDom.querySelector('*[*|id="' + target + '"]')
        const measure = elem.closest('measure')
        const index = measures.indexOf(measure)

        if (!arr[index]) {
          arr[index] = [target]
        } else {
          arr[index].push(target)
        }
        // console.log('found in measure ' + index + ', id ' + measures[index].getAttribute('xml:id'))
      })

      let i = 0
      let targetCounter = 0
      while (i < arr.length) {
        if (arr[i] === null || arr[i] === undefined) {
          targetCounter = 0
        } else {
          if (targetCounter === 0) {
            const startLabel = measures[i].hasAttribute('label') ? measures[i].getAttribute('label') : measures[i].getAttribute('n')
            previews.push({ start: measures[i].getAttribute('xml:id'), end: measures[i].getAttribute('xml:id'), targets: arr[i], startLabel })
            targetCounter++
          } else {
            const entry = previews[previews.length - 1]
            const endLabel = measures[i].hasAttribute('label') ? measures[i].getAttribute('label') : measures[i].getAttribute('n')
            entry.end = measures[i].getAttribute('xml:id')
            entry.endLabel = endLabel
            arr[i].forEach(target => {
              entry.targets.push(target)
            })
          }
        }
        i++
      }

      return previews
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
</style>
