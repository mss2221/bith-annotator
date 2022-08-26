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
    }
  },
  methods: {

  },
  beforeUnmount () {
    console.log(this.unwatchers)
    this.unwatchers.forEach(unwatch => {
      unwatch()
    })
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
          const renderedSvg = document.querySelector('#meiContainer_' + this.idSeed + ' svg')

          let selectables = []
          // const selNoBBox = []
          vrvSelectables.forEach(elem => {
            selectables.push('.' + elem + ':not(.bounding-box)')
          })
          selectables = selectables.join(', ')
          console.log('selectables:', selectables)

          const clickListener = (e) => {
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
            // todo: this needs to be coming from the store…
            // closest.classList.toggle('selected')
          }

          console.log('renderedSvg:')
          console.log(renderedSvg)

          renderedSvg.addEventListener('click', clickListener)

          // renderedSvg.addEventListener('click', clickListener)
          /* renderedSvg.querySelectorAll(selectables).forEach(elem => {
            elem.addEventListener('click', clickListener)
          }) */

          const watchFuncCurrent = () => {
            return this.$store.getters.currentSelectionsForUri(this.uri)
          }
          this.unwatchers.push(this.$store.watch(watchFuncCurrent, (newArr, oldArr) => {
            const addedVals = newArr.filter(val => oldArr.indexOf(val) === -1)
            const removedVals = oldArr.filter(val => newArr.indexOf(val) === -1)

            addedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
                elem.classList.add('current')
              } catch (err) {}
            })

            removedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
                elem.classList.remove('current')
              } catch (err) {}
            })
          }))

          const watchFuncAll = () => {
            return this.$store.getters.allSelectionsForUri(this.uri)
          }
          this.unwatchers.push(this.$store.watch(watchFuncAll, (newArr, oldArr) => {
            const addedVals = newArr.filter(val => oldArr.indexOf(val) === -1)
            const removedVals = oldArr.filter(val => newArr.indexOf(val) === -1)

            addedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
                elem.classList.add('selected')
              } catch (err) {}
            })

            removedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
                elem.classList.remove('selected')
              } catch (err) {}
            })
          }))

          const watchFuncCurrentMusMat = () => {
            return this.$store.getters.allSelectionsForCurrentMusMat(this.uri)
          }
          this.unwatchers.push(this.$store.watch(watchFuncCurrentMusMat, (newArr, oldArr) => {
            const addedVals = newArr.filter(val => oldArr.indexOf(val) === -1)
            const removedVals = oldArr.filter(val => newArr.indexOf(val) === -1)

            addedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
                elem.classList.add('currentMusmat')
              } catch (err) {}
            })

            removedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
                elem.classList.remove('currentMusmat')
              } catch (err) {}
            })
          }))

          const watchFuncCurrentExtract = () => {
            return this.$store.getters.allSelectionsForCurrentExtract(this.uri)
          }
          this.unwatchers.push(this.$store.watch(watchFuncCurrentExtract, (newArr, oldArr) => {
            const addedVals = newArr.filter(val => oldArr.indexOf(val) === -1)
            const removedVals = oldArr.filter(val => newArr.indexOf(val) === -1)

            addedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
                elem.classList.add('currentExtract')
              } catch (err) {}
            })

            removedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
                elem.classList.remove('currentExtract')
              } catch (err) {}
            })
          }))

          const watchFuncCurrentSelection = () => {
            return this.$store.getters.allSelectionsForCurrentSelection(this.uri)
          }
          this.unwatchers.push(this.$store.watch(watchFuncCurrentSelection, (newArr, oldArr) => {
            // const addedVals = newArr.filter(val => oldArr.indexOf(val) === -1)
            const removedVals = oldArr.filter(val => newArr.indexOf(val) === -1)

            newArr.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
                elem.classList.add('currentSelection')
              } catch (err) {}
            })

            removedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id + ']')
                elem.classList.remove('currentSelection')
              } catch (err) {}
            })
          }))
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

      &.currentSelection, &.currentMusmat {

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

      &.currentExtract {

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
