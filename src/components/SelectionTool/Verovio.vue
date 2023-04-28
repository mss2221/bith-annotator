<template>
  <div>
    <div class="verovioPaneTitle">
      <span>{{ title }}</span>
      <div class="dropdown movementSelection">
        <div class="btn-group">
          <a href="#" ref="activeMovement" class="btn btn-link">
            Movement
          </a>
          <a href="#" class="btn btn-link dropdown-toggle" tabindex="0">
            <i class="icon icon-caret"></i>
          </a>

          <!-- menu component -->
          <ul ref="movementList" class="menu"></ul>
        </div>
      </div>
    </div>
    <div v-bind:id="'meiContainer_' + idSeed" class="meiContainer" ref="mei">
      <span v-bind:id="'activity_' + idSeed">Loading</span> MEI Data
      <div class="loading loading-lg"></div>
    </div>
  </div>
</template>

<script>
import verovio from 'verovio'
// import svgDragSelect from "svg-drag-select"
import { vrvPresets, vrvSelectables } from '@/config/verovio.config.js'
import { bithTypes } from '@/meld/constants.js'

const parser = new DOMParser()

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
    settings: String,
    title: String,
    index: Number
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
    },
    currentMdiv: function () {
      return this.$store.getters.verovioCurrentMdivIndex(this.index)
    }
  },
  methods: {
    clickListenerSVG: function (e) {
      const target = e.target
      // console.log('target:', target)
      const closest = (e.shiftKey) ? target.closest('.measure:not(.bounding-box)') : target.closest(selectables)

      // console.log('clicked', closest)

      e.stopPropagation()
      if (!this.selectionModeActive) {
        // console.log('a')
        return false
      }

      /*
      if (closest.classList.contains('staff') || closest.classList.contains('measure')) {
        // console.log('selected a staff or measure')
        const children = closest.querySelectorAll(selectables)
        // console.log('found children:')
        // console.log(children)
      }
      */

      // console.log('clicked ', target, closest)
      this.$store.dispatch('selectionToggle', this.uri + '#' + closest.getAttribute('data-id'))
      // console.log('dispatched selectionToggle')
    },

    highlightSelections: function (newSelections, oldSelections, className) {
      // console.log('highlighting ' + className + ' (' + newSelections.length + ')')
      const addedVals = newSelections.filter(val => oldSelections.indexOf(val) === -1)
      const removedVals = oldSelections.filter(val => newSelections.indexOf(val) === -1)

      addedVals.forEach(val => {
        // console.log('adding ' + className + ' to ' + val)

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
      try {
        unwatch()
      } catch (err) {
        console.log('unable to unwatch verovio changes: ' + err)
      }
    })

    document.querySelector('#meiContainer_' + this.idSeed + ' > svg').removeEventListener('click', this.clickListenerSVG)
    document.querySelector('#meiContainer_' + this.idSeed).innerHTML = 'empty'
  },
  beforeUpdate: function () {
    // console.log('things are updating, so I may want to respond!!!')
  },
  mounted: function () {
    // console.log('mounted verovio (again)?!', this.$refs.mei)
    // eslint-disable-next-line
    const vrvToolkit = new verovio.toolkit()
    const options = (typeof vrvPresets[this.settings] === 'object') ? vrvPresets[this.settings] : vrvPresets.fullScore

    vrvToolkit.setOptions(options)

    this.unwatchers = []

    // don't call the same content twice
    if (this.$refs.mei.querySelector('svg') !== null) {
      return false
    }

    this.unwatchers.push(
      this.$store.watch(
        (state, getters) => getters.verovioCurrentMdivIndex(this.index), (newIndex, oldIndex) => {
          // this.renderMei()
        }
      )
    )

    this.$store.dispatch('loadMEI', this.uri)
      .then(() => {
        const mei = this.$store.getters.mei(this.uri)
        vrvToolkit.loadData(mei)
        /* const pos = this.currentMdiv + 2
        options.mdivXPathQuery = '.[position() = ' + pos + ']'
        vrvToolkit.setOptions(options) */
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
                // scroll to elements in question
                const targets = []
                newSel.forEach(sel => {
                  targets.push(sel.split('#')[1])
                })
                const offsets = []

                const svgPixelWidth = parseInt(this.$refs.mei.querySelector('svg').getAttribute('width'))
                const svgViewBoxWidth = parseInt(this.$refs.mei.querySelector('svg svg').getAttribute('viewBox').split(' ')[2])

                targets.forEach(id => {
                  if (!id.startsWith('xywh=')) {
                    try {
                      const elem = this.$refs.mei.querySelector('*[data-id=' + id + ']')
                      if (elem) {
                        offsets.push(elem.getBBox().x)
                      }
                    } catch (err) {
                      console.warn('ERROR: ' + err)
                    }
                  }
                })
                // when something was found, horizontally move to that location
                if (offsets.length > 0) {
                  const min = Math.min(...offsets)
                  const pixMin = svgPixelWidth * min / svgViewBoxWidth
                  this.$refs.mei.scrollLeft = pixMin
                }

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

          this.unwatchers.push(

          )
        }

        // set up navigation
        const meiDom = parser.parseFromString(mei, 'application/xml')

        meiDom.querySelectorAll('mdiv').forEach((mdiv, i) => {
          const id = (mdiv.hasAttribute('xml:id')) ? mdiv.getAttribute('xml:id') : (null)
          const num = i + 1
          const label = (mdiv.hasAttribute('label')) ? mdiv.getAttribute('label') : ('Movement ' + num)
          const measures = []
          mdiv.querySelectorAll('measure').forEach((measure, n) => {
            const mnum = (measure.hasAttribute('label')) ? measure.getAttribute('label') : measure.getAttribute('n')
            measures.push(mnum)
          })

          const changeFunc = () => {
            this.$store.dispatch('announceCurrentMdiv', { viewIndex: this.index, mdivIndex: i })
          }

          const li = document.createElement('li')
          li.setAttribute('data-mdiv-id', id)
          li.setAttribute('data-measureCount', measures.length)
          li.addEventListener('click', changeFunc)
          li.textContent = label

          if (i === 0) {
            this.$refs.activeMovement.textContent = label
          } else {
            li.classList.add('disabled')
          }

          this.$refs.movementList.append(li)

          // mdivs.push(obj)
        })
        // console.log('\n\n\nmdivs: ', mdivs)
      })
    /* fetch(this.uri)
      .then(res => {
        document.querySelector('#activity_' + this.idSeed).innerHTML = 'Processing'
        return res.text()
      })
      .then(mei => {

      }) */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

.verovioPaneTitle {
  padding: 0 .3rem;
  font-weight: 700;

  .movementSelection {
    a {
      font-weight: 400;
      margin-left: .4rem;
      color: #000000;

      &:first-child {
        padding-right: 0;
      }
    }

    .disabled {
      cursor: not-allowed;
      font-weight: 300;
    }
  }
}

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
        fill: $svgSelectionEvents;
        stroke: $svgSelectionEvents;
      }

      &.measure .bounding-box.staff {
        rect {
          fill: $svgSelectionMeasures;
        }
      }

      & > .bounding-box.staff rect {
        fill: $svgSelectionStaves; //rgba(255,0,0,.15);
      }

      &.activeSelection {

        &:not(.staff):not(.measure) {
          fill: $svgActiveSelectionEvents;
          stroke: $svgActiveSelectionEvents;
        }

        &.measure .bounding-box.staff {
          rect {
            fill: $svgActiveSelectionMeasures;
          }
        }

        & > .bounding-box.staff {
          rect {
            fill: $svgActiveSelectionStaves !important;
          }
        }
      }

      &.activeExtract {

        &:not(.staff):not(.measure) {
          fill: $svgCurrentExtractEvents;
          stroke: $svgCurrentExtractEvents;
        }

        &.measure .bounding-box.staff {
          rect {
            fill: $svgCurrentExtractMeasures;
          }
        }

        & > .bounding-box.staff {
          rect {
            fill: $svgCurrentExtractStaves !important;
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
