<template>
  <div :id="containerID" class="previewContent facsimile"></div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
// import { bithTypes } from '@/meld/constants.js'

export default {
  name: 'PreviewFacsimile',
  components: {

  },
  props: {
    obj: Object,
    index: Number
  },
  computed: {
    containerID: function () {
      return 'previewFacsimile_' + this.index
    },
    imageUri: function () {
      const part = this.obj.part
      const uri = (part.indexOf('#') !== -1) ? part.split('#')[0] : part
      return uri
    },
    xywh: function () {
      const part = this.obj.part
      const xywh = (part.indexOf('#xywh=') !== -1) ? part.split('#xywh=')[1].split(',') : undefined
      if (xywh) {
        xywh.forEach((dim, i) => {
          xywh[i] = parseInt(dim)
        })
      }
      return xywh
    }
  },
  mounted: function () {
    /**
     * Settings for OpenSeadragon.
     * @type {Object}
     */
    const osdConfig = {
      id: this.containerID,
      preserveViewport: false,
      visibilityRatio: 0.1, // allow extreme scroll, but not so much it disappears
      sequenceMode: false,
      showNavigator: false,
      showHomeControl: false,
      showNavigationControl: false,
      showFullPageControl: false,
      gestureSettingsMouse: {
        clickToZoom: false
      },
      silenceMultiImageWarnings: true,
      constrainDuringPan: true,
      tileSources: [this.imageUri]
    }

    /**
     * The OpenSeadragon instance
     * @type {[type]}
     */
    this.viewer = OpenSeadragon(osdConfig)

    if (this.xywh) {
      const loadOverlay = () => {
        const elem = document.createElement('div')
        elem.classList.add('iiifMediaFragmentPreview')

        const worldX = this.viewer.world._contentSize.x
        const worldY = this.viewer.world._contentSize.y

        const x = this.xywh[0] / worldX
        const y = this.xywh[1] / worldY
        const w = this.xywh[2] / worldX
        const h = this.xywh[3] / worldY

        const rect = new OpenSeadragon.Rect(x, y, w, h)

        this.viewer.addOverlay({
          element: elem,
          location: rect
        })
        this.viewer.viewport.fitBounds(rect)
      }

      this.viewer.addHandler('open', loadOverlay)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

.previewContent.facsimile {
  width: 100%;
  height: 100%;
}

.iiifMediaFragmentPreview {
  outline: 1px solid #ff0202;
  box-shadow: 0 0 10px black;
  border-radius: 2px;
}
</style>
