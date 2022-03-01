<template>
  <div v-bind:id="'meiContainer_' + idSeed" class="meiContainer">
    <span v-bind:id="'activity_' + idSeed">Loading</span> MEI Data
    <div class="loading loading-lg"></div>
  </div>
</template>

<script>
import verovio from 'verovio'
import svgDragSelect from "svg-drag-select"

const verovioOptions = {
  scale: 30,
  breaks: 'none',
  openControlEvents: true,
  svgBoundingBoxes: true,
  svgRemoveXlink: true,
  header: 'none',
  footer: 'none',
  mnumInterval: 5
}

let listeners = []

let addListener = (anchor) => {
  listeners.push(anchor.addEventListener('click',(e) => {
    const staff = e.target.parentNode.parentNode
    staff.classList.toggle('marked')
  }))
}

export default {
  name: 'Verovio',
  props: {
    uri: String,
    idSeed: String
  },
  computed: {

  },
  methods: {

  },
  mounted: function () {

    verovio.module.onRuntimeInitialized = () => {
      const vrvToolkit = new verovio.toolkit()
      vrvToolkit.setOptions(verovioOptions)
      fetch(this.uri)
        .then(res => {
          document.querySelector('#activity_' + this.idSeed).innerHTML = 'Processing'
          return res.text()
        })
        .then(mei => {
          vrvToolkit.loadData(mei)
          const svg = vrvToolkit.renderToSVG(1, {})
          document.querySelector('#meiContainer_' + this.idSeed).innerHTML = svg

          // document.querySelectorAll('#meiContainer_ .staff > .staff.bounding-box > rect').forEach(bbox => addListener(bbox))

          const mei_svg = document.querySelector('#meiContainer_' + this.idSeed + ' > svg')
          console.log('found svg: ', mei_svg)


          const strictIntersectionSelector = ({
            svg,                            // the svg element.
            referenceElement,               // please select only descendants of this SVGElement if specified.
            pointerEvent,                   // a `PointerEvent` instance with either a "pointerdown" event or a "pointermove" event.
                                            // (in case of Safari, a `MouseEvent` or a `TouchEvent` is used instead.)
            dragAreaInClientCoordinate,     // a `SVGRect` that represents the dragging area in client coordinate.
            dragAreaInSvgCoordinate,        // a `SVGRect` that represents the dragging area in svg coordinate.
            dragAreaInInitialSvgCoordinate, // a `SVGRect` that represents the dragging area in initial viewport coordinate of the svg.
            getEnclosures,                  // `getEnclosures()` returns elements enclosed in the dragging area.
            getIntersections,               // `getIntersections()` returns elements intersect the dragging area.
                                            // Chrome, Safari and Firefox checks only bounding box intersection.
          }) => getIntersections().filter(element => {
            // the element that the pointer event raised is considered to intersect.
            console.log('hello', element)
            if (pointerEvent.target === element) {
              return true
            }
            // strictly check only <path>s.
            if (!(element instanceof SVGPathElement)) {
              return true
            }
            // check if there is at least one enclosed point in the path.
            for (let i = 0, len = element.getTotalLength(); i <= len; i += 4 /* arbitrary */) {
              const { x, y } = element.getPointAtLength(i)
              if (
                  dragAreaInSvgCoordinate.x <= x && x <= dragAreaInSvgCoordinate.x + dragAreaInSvgCoordinate.width &&
                  dragAreaInSvgCoordinate.y <= y && y <= dragAreaInSvgCoordinate.y + dragAreaInSvgCoordinate.height
              ) {
                return true
              }
            }
            return false
          })

          console.log(svgDragSelect)

          const { cancel } = svgDragSelect({
            svg: mei_svg,
            selector: strictIntersectionSelector,//'enclosure', // 'enclosure' or: 'intersection'
            onSelectionStart: (e) => {
              console.log('onSelectionStart', e)
            },
            onSelectionChange: (e) => {
              console.log('onSelectionChange', e)
            },
            onSelectionEnd: (e) => {
              console.log('onSelectionEnd', e)
            }
            /*onSelectionChange({
              svg,                      // the svg element.
              pointerEvent,             // a `PointerEvent` instance with either a "pointerdown" event or a "pointermove" event.
                                        // (in case of Safari, a `MouseEvent` or a `TouchEvent` is used instead.)
              selectedElements,         // selected element array.
              previousSelectedElements, // previous selected element array.
              newlySelectedElements,    // `selectedElements - previousSelectedElements`
              newlyDeselectedElements,  // `previousSelectedElements - selectedElements`
            }) {
              // for example: toggle "data-selected" attribute
              newlyDeselectedElements.forEach(element => element.removeAttribute('data-selected'))
              newlySelectedElements.forEach(element => element.setAttribute('data-selected', ''))
            }*/
          })

          console.log('setup presumably correct')
          console.log(cancel)



        })

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

.meiContainer {
  overflow: auto;

  svg {
    .marked.staff > .staff.bounding-box > rect {
      fill: rgba(0,100,0,0.3)
    }

    .active.marked.staff > .staff.bounding-box > rect {
      fill: rgba(0,100,0,0.6)
    }
  }

}
.svg-drag-select-area-overlay {
  border: 1px solid rgba(0,0,0,.7);
  background-color: rgba(255,0,0,.4);
}
</style>
