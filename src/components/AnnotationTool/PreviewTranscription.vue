<template>
  <div :id="containerID" class="previewContent transcription" ref="mei">

  </div>
</template>

<script>
import verovio from 'verovio'
import { vrvPresets } from '@/config/verovio.config.js'
// import OpenSeadragon from 'openseadragon'
// import { bithTypes } from '@/meld/constants.js'

export default {
  name: 'PreviewTranscription',
  components: {

  },
  props: {
    obj: Object,
    index: Number
  },
  computed: {
    containerID: function () {
      return 'previewTranscription_' + this.index
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

</style>
