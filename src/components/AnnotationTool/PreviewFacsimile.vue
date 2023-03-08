<template>
  <div class="previewBox">
    <h1 class="previewHeading">{{ label }} <i class="icon icon-search" title="Show Selection" @click="showSelection"></i></h1>
    <div :id="containerID" class="previewContent facsimile"></div>
  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
import { bithTypes, displayPrefixes } from '@/meld/constants.js'
import {
  createSolidDataset,
  setThing,
  solidDatasetAsTurtle
} from '@inrupt/solid-client'

export default {
  name: 'PreviewFacsimile',
  components: {

  },
  props: {
    obj: Object,
    index: Number
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
    label: function () {
      const arrangement = this.$store.getters.arrangements.find(arr => arr.id === this.obj.arrangement.id)
      const page = arrangement.iiifTilesources.indexOf(this.obj.fileUri) + 1
      const label = this.obj.arrangement.label + ', p.' + page
      return label // this.obj
    },
    containerID: function () {
      return 'previewFacsimile_' + this.index
    },
    imageUri: function () {
      const part = this.obj.fileUri
      const uri = (part.indexOf('#') !== -1) ? part.split('#')[0] : part
      return uri
    },
    rects: function () {
      const arr = []
      this.obj.parts.forEach(part => {
        const xywh = (part.indexOf('#xywh=') !== -1) ? part.split('#xywh=')[1].split(',') : undefined
        if (xywh) {
          xywh.forEach((dim, i) => {
            xywh[i] = parseInt(dim)
          })
          arr.push({ x: xywh[0], y: xywh[1], w: xywh[2], h: xywh[3] })
        }
      })

      return arr
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

    if (this.rects.length > 0) {
      const loadOverlay = () => {
        this.rects.forEach(xywh => {
          const elem = document.createElement('div')
          elem.classList.add('iiifMediaFragmentPreview')

          const worldX = this.viewer.world._contentSize.x
          const worldY = this.viewer.world._contentSize.y

          const x = xywh.x / worldX
          const y = xywh.y / worldY
          const w = xywh.w / worldX
          const h = xywh.h / worldY

          const rect = new OpenSeadragon.Rect(x, y, w, h)

          this.viewer.addOverlay({
            element: elem,
            location: rect
          })
          this.viewer.viewport.fitBounds(rect)
        })
      }

      this.viewer.addHandler('open', loadOverlay)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

.previewBox {
  width: 100%;
  height: 100%;
}

h1.previewHeading {
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

  i {
    margin-left: .6rem;
    cursor: pointer;
  }
}

.previewContent.facsimile {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #666666,#333333);
}

.iiifMediaFragmentPreview {
  outline: 1px solid #ff0202;
  box-shadow: 0 0 10px black;
  border-radius: 2px;
}
</style>
