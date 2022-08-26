<template>
  <div v-bind:id="'meiContainer_' + idSeed" class="meiContainer" ref="mei">
    <span v-bind:id="'activity_' + idSeed">Loading</span> MEI Data
    <div class="loading loading-lg"></div>
  </div>
</template>

<script>
import verovio from 'verovio'
// import svgDragSelect from "svg-drag-select"
import { vrvPresets, vrvSelectables } from '@/config/verovio.config.js'
import { bithTypes } from '@/meld/constants.js'

let selectables = []
vrvSelectables.forEach(elem => {
  selectables.push('.' + elem + ':not(.bounding-box)')
})
selectables = selectables.join(', ')

/* const verovioOptions = {
  scale: 30,
  breaks: 'none',
  openControlEvents: true,
  svgBoundingBoxes: true,
  svgRemoveXlink: true,
  header: 'none',
  footer: 'none',
  mnumInterval: 5
} */

// const listeners = []
/*
let addListener = (anchor) => {
  listeners.push(anchor.addEventListener('click',(e) => {
    const staff = e.target.parentNode.parentNode
    staff.classList.toggle('marked')
  }))
}
*/
export default {
  // eslint-disable-next-line
  name: 'Verovio',
  props: {
    uri: String,
    idSeed: String,
    settings: String
  },
  computed: {
    selectionModeActive: function () {
      return this.$store.getters.selectionModeActive
    },
    currentSelection: function () {
      return this.$store.getters.activeThingByType(bithTypes.selection)
    },
    currentExtract: function () {
      return this.$store.getters.activeThingByType(bithTypes.extract)
    },
    currentSelectionsForUri: function () {
      return this.$store.getters.currentSelectionsForUri(this.uri)
    },
    allSelectionsForUri: function () {
      return this.$store.getters.allSelectionsForUri(this.uri)
    },
    allSelectionsForActiveExtract: function () {
      return this.$store.getters.allSelectionsForActiveExtract(this.uri)
    },
    allSelectionsForActiveSelection: function () {
      return this.$store.getters.allSelectionsForActiveSelection(this.uri)
    }
  },
  methods: {
    clickListenerSVG: function (e) {
      const target = e.target
      console.log('target:', target)
      const closest = (e.shiftKey) ? target.closest('.measure:not(.bounding-box)') : target.closest(selectables)

      console.log('clicked', closest)

      e.stopPropagation()
      if (!this.selectionModeActive) {
        console.log('a')
        return false
      }

      if (closest.classList.contains('staff') || closest.classList.contains('measure')) {
        console.log('selected a staff or measure')
        const children = closest.querySelectorAll(selectables)
        console.log('found children:')
        console.log(children)
      }

      console.log('clicked ', target, closest)
      this.$store.dispatch('selectionToggle', this.uri + '#' + closest.getAttribute('data-id'))
      console.log('dispatched selectionToggle')
    },

    highlightSelections: function (newSelections, oldSelections, className) {
      // console.log('highlighting ' + className + ' (' + newSelections.length + ')')
      const addedVals = newSelections.filter(val => oldSelections.indexOf(val) === -1)
      const removedVals = oldSelections.filter(val => newSelections.indexOf(val) === -1)

      addedVals.forEach(val => {
        const id = val.split('#')[1]
        try {
          const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
          elem.classList.add(className)
        } catch (err) {}
      })

      removedVals.forEach(val => {
        const id = val.split('#')[1]
        try {
          const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
          elem.classList.remove(className)
        } catch (err) {}
      })
    }
  },
  beforeUnmount () {
    this.unwatchers.forEach(unwatch => {
      unwatch()
    })

    document.querySelector('#meiContainer_' + this.idSeed + ' > svg').removeEventListener('click', this.clickListenerSVG)
    document.querySelector('#meiContainer_' + this.idSeed).innerHTML = 'empty'
  },
  mounted: function () {
    // eslint-disable-next-line
    const vrvToolkit = new verovio.toolkit()
    const options = (typeof vrvPresets[this.settings] === 'object') ? vrvPresets[this.settings] : vrvPresets.fullScore

    vrvToolkit.setOptions(options)

    this.unwatchers = []

    // don't call the same content twice
    if (this.$refs.mei.querySelector('svg') !== null) {
      return false
    }
    fetch(this.uri)
      .then(res => {
        document.querySelector('#activity_' + this.idSeed).innerHTML = 'Processing'
        return res.text()
      })
      .then(mei => {
        vrvToolkit.loadData(mei)
        const svg = vrvToolkit.renderToSVG(1, {})
        // document.querySelector('#meiContainer_' + this.idSeed).innerHTML = svg
        this.$refs.mei.innerHTML = svg

        if (this.settings === 'fullScore') {
          const renderedSvg = document.querySelector('#meiContainer_' + this.idSeed + ' > svg')

          // listen to clicks on the svg, used for selections
          renderedSvg.addEventListener('click', this.clickListenerSVG)

          // listen for changes to selections in currentAnnot
          this.unwatchers.push(
            this.$store.watch(
              (state, getters) => getters.currentSelectionsForUri(this.uri), (newSel, oldSel) => {
                this.highlightSelections(newSel, oldSel, 'current')
              }
            )
          )
          this.highlightSelections(this.currentSelectionsForUri, [], 'current')

          // listen for changes to selections in all annot
          this.unwatchers.push(
            this.$store.watch(
              (state, getters) => getters.allSelectionsForUri(this.uri), (newSel, oldSel) => {
                this.highlightSelections(newSel, oldSel, 'selected')
              }
            )
          )
          this.highlightSelections(this.allSelectionsForUri, [], 'selected')

          // listen for changes to selections in all annot
          this.unwatchers.push(
            this.$store.watch(
              (state, getters) => getters.allSelectionsForActiveExtract(this.uri), (newSel, oldSel) => {
                this.highlightSelections(newSel, oldSel, 'activeExtract')
              }
            )
          )
          this.highlightSelections(this.allSelectionsForActiveExtract, [], 'activeExtract')

          // listen for changes to selections in all annot
          this.unwatchers.push(
            this.$store.watch(
              (state, getters) => getters.allSelectionsForActiveSelection(this.uri), (newSel, oldSel) => {
                this.highlightSelections(newSel, oldSel, 'activeSelection')
              }
            )
          )
          this.highlightSelections(this.allSelectionsForActiveSelection, [], 'activeSelection')
        }
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

.meiContainer {
  overflow: auto;
  // background-color: #ffffff;

  svg {
    .marked.staff > .staff.bounding-box > rect {
      fill: rgba(0,100,0,0.3)
    }

    .active.marked.staff > .staff.bounding-box > rect {
      fill: rgba(0,100,0,0.6)
    }

    .selected, .current {

      &:not(.staff):not(.measure) {
        fill: rgba(150,0,0,1);
        stroke: rgba(150,0,0,1);
      }

      & > .bounding-box.staff rect {
        fill: #dfd8d8; //rgba(255,0,0,.15);
      }

      &.activeSelection, &.activeMusmat {

        &:not(.staff):not(.measure) {
          fill: #666666;
          stroke: #666666;
        }

        &.measure .bounding-box.staff {
          rect {
            fill: #e5e5e5;
          }
        }

        & > .bounding-box.staff {
          rect {
            fill: #0f83ff24;
            fill: #cccccc !important;
          }
        }
      }

      &.activeExtract {

        &:not(.staff):not(.measure) {
          fill: #2582b5f4;
          stroke: #2582b5f4;
        }

        &.measure .bounding-box.staff {
          rect {
            fill: #0f83ff24;
          }
        }

        & > .bounding-box.staff {
          rect {
            fill: #0f83ff24;
            fill: #0f83ff55 !important;
          }
        }

      }
    }
  }

}
.svg-drag-select-area-overlay {
  border: 1px solid rgba(0,0,0,.7);
  background-color: rgba(255,0,0,.4);
}
</style>
