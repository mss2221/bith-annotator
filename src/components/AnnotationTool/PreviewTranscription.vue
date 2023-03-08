<template>
  <div class="previewBox">
    <h1 class="previewHeading">{{ label }} <i class="icon icon-search" title="Show Selection" @click="showSelection"></i></h1>
    <div :id="containerID" class="previewContent transcription" ref="mei">

    </div>
  </div>

</template>

<script>
import verovio from 'verovio'
import { vrvPresets } from '@/config/verovio.config.js'
import { bithTypes, displayPrefixes } from '@/meld/constants.js'
import {
  createSolidDataset,
  setThing,
  solidDatasetAsTurtle
} from '@inrupt/solid-client'

export default {
  name: 'PreviewTranscription',
  components: {

  },
  props: {
    obj: Object,
    index: Number,
    settings: Object
  },
  methods: {
    showSelection: async function () {
      const thing = this.$store.getters.thingByTypeAndID(bithTypes.selection, this.obj.selection)

      let ds = createSolidDataset()
      ds = setThing(ds, thing)

      const ttl = await solidDatasetAsTurtle(ds, { prefixes: displayPrefixes })
      this.$store.dispatch('setLdDetails', ttl)
    }
  },
  computed: {
    containerID: function () {
      return 'previewTranscription_' + this.index
    },
    label: function () {
      // const arrangement = this.$store.getters.arrangements.find(arr => arr.id === this.obj.arrangement.id)
      const label = this.obj.arrangement.label + ', m.' + this.settings.startLabel + ((this.settings.endLabel) ? '–' + this.settings.endLabel : '')
      return label // this.obj
    }
  },
  mounted: function () {
    // eslint-disable-next-line
    const vrvToolkit = new verovio.toolkit()
    const options = vrvPresets.annotationPreview

    vrvToolkit.setOptions(options)

    this.$store.dispatch('loadMEI', this.obj.fileUri)
      .then(() => {
        const mei = this.$store.getters.mei(this.obj.fileUri)
        vrvToolkit.select(this.settings)
        vrvToolkit.loadData(mei)
        const svg = vrvToolkit.renderToSVG(1, {})

        this.$refs.mei.innerHTML = svg
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

.previewBox {
  background-color: #ffffff;
  padding-top: .6rem;
}

.previewContent.transcription {
    overflow: auto;
}
</style>
