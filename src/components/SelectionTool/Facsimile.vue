<template>
  <div class="facsimileBox">
    <div class="buttonBox">
      <div class="userButtons buttonRow">
        <div class="facsButton zoomOut" :id="'zoomOut_' + idSeed"><i class="icon icon-minus"></i></div>
        <div class="facsButton zoomIn" :id="'zoomIn_' + idSeed"><i class="icon icon-plus"></i></div>
        <div class="facsButton prevPage" :id="'prevPage_' + idSeed"><i class="icon icon-arrow-left"></i></div>
        <div class="facsButton nextPage" :id="'nextPage_' + idSeed"><i class="icon icon-arrow-right"></i></div>
      </div>
      <div class="extraButtons buttonRow" :class="{'invis': !isLoggedIn}" :id="'toolbar_' + idSeed"></div>
    </div>

    <div v-bind:id="this.containerID" class="iiifContainer">

    </div>
  </div>

</template>

<script>

import OpenSeadragon from 'openseadragon'
import * as Annotorious from '@recogito/annotorious-openseadragon'
import Toolbar from '@recogito/annotorious-toolbar'
import '@recogito/annotorious-openseadragon/dist/annotorious.min.css'
import { uuid } from '@/store/tools/uuid.js'
import { bithTypes } from '@/meld/constants.js'

export default {
  // eslint-disable-next-line
  name: 'Facsimile',
  props: {
    uri: String,
    idSeed: String,
    index: Number
  },
  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn
    },
    userId: function () {
      return this.$store.getters.solidId
    },
    userName: function () {
      return this.$store.getters.solidUser
    },
    containerID: function () {
      return 'iiifContainer_' + this.idSeed
    }
  },
  methods: {
    /**
     * This function extracts the relevant details from a IIIF manifest
     * param manifest: The IIIF manifest as Javascript object (i.e., already parsed from JSON)
     * return arr: Returns an array with details about the pages of the document, each
     *    with the following properties:
     *      imageUri: the IIIF ImageAPI info.json link for the current page
     *      measuresUri: the link to an IIIF annotation with measure rectangles
     *      label: a label for the current page
     *      width: the pixel width of the current page
     *      height: the pixel height of the current page
     */
    parseManifest: function (manifest) {
      // create an empty array that will hold details for every page
      const arr = []
      // iterate over the manifest canvas sequence. This is simplifying, in that it makes rather assumptions on the manifest. Probably ok for our own manifests, though.
      manifest.sequences[0].canvases.forEach((canvas, ci) => {
        // get link to IIIF Image API info.json file. If necessary, append '/info.json'
        let imageUri = canvas.images[0].resource.service['@id']
        imageUri = imageUri.endsWith('/info.json') ? imageUri : imageUri + '/info.json'

        // get otherContent prop and retrieve link to measure zones. This makes _very_ strong assumptions!
        /* const otherContent = canvas.otherContent
        let measuresUri = null
        if (otherContent !== undefined) {
          measuresUri = otherContent.find(item => {
            const ocId = item?.within['@id']
            const endsWith = (ocId === undefined) ? false : ocId.endsWith('/measureZones')
            return endsWith
          })
          if (typeof measuresUri !== 'undefined') {
            measuresUri = measuresUri['@id']
          }
        } */

        // retrieve some basic props for each page
        const label = canvas.label
        const width = canvas.images[0].resource.width
        const height = canvas.images[0].resource.height

        // create an object with all the retrieved infos
        const obj = {
          imageUri,
          // measuresUri,
          label,
          width,
          height
        }

        // push the object to the array
        arr.push(obj)
      })
      // return the array
      return arr
    },

    /**
     * This function parses an IIIF annotation that gives the bounding box of a measure
     * param json: The json referenced from a IIIF manifest, holding details about measure rects on a page
     * return arr: Returns an array with details about each measure on a page
     *    with the following properties:
     *      id: the ID of the referenced object
     *      x: x position of the measure's bbox
     *      y: y position of the measure's bbox
     *      w: width of the measure's bbox
     *      h: height of the measure's bbox
     *      label: The label of the measure
     */
    parseMeasureJson: function (json) {
      // create empty array to hold details about each measure
      const arr = []
      // iterate over all measures
      json.resources.forEach(iiifAnnot => {
        // the ID is the last part of the URI, after the final slash
        const id = iiifAnnot['@id'].split('/').slice(-1)[0]
        // create an array with xywh values after extracting the right part of the xywh= string
        const xywh = iiifAnnot.on.selector.value.substr(5).split(',')
        const x = xywh[0]
        const y = xywh[1]
        const w = xywh[2]
        const h = xywh[3]
        const label = iiifAnnot.resource.chars
        // create an obj with all extracted props
        const obj = {
          id,
          x,
          y,
          w,
          h,
          label
        }
        // push obj to array
        arr.push(obj)
      })
      // return array
      return arr
    },

    /**
     * This function loads additional stuff for a page *after* it is displayed by OSD.
     * Used to load measures, but also annotations (if any)
     */
    preparePage: function () {
      const currentPage = this.viewer.currentPage()
      this.currentImageUri = this.facsimileInfo[currentPage].imageUri.replace('/info.json', '')
      console.log('calling preparePage on page ' + this.currentImageUri + ' at ' + this.index)

      const selections = this.$store.getters.facsimileSelectionsByViewIndex(this.index)
      this.viewer.clearOverlays()
      // console.log(selections)

      // This is a working (!) way to render the selections with Annotorious
      // However, as we need to render measures differently anyway, we use a
      // different approach

      /*
      const annots = []
      selections.forEach(selection => {

        const annot = {
          type: 'Annotation',
          body: [{
            type: 'TextualBody',
            purpose: 'tagging',
            value: 'measure'
          }],
          target: {
            source: this.currentImageUri,
            selector: {
              type: 'FragmentSelector',
              conformsTo: 'http://www.w3.org/TR/media-frags/',
              value: 'xywh=pixel:' + selection.x + ',' + selection.y + ',' + selection.w + ',' + selection.h
            }
          },
          '@context': 'http://www.w3.org/ns/anno.jsonld',
          id: selection.id
        }
        annots.push(annot)

      })
      this.anno.setAnnotations(annots)
      */

      selections.forEach(selection => {
        const elem = document.createElement('div')
        elem.setAttribute('data-selection-id', selection.id)
        const extracts = Object.keys(selection.extracts)
        elem.setAttribute('data-extracts', extracts.join(' '))

        elem.classList.add('overlay')
        elem.classList.add('selection')
        selection.classList.forEach(cl => {
          elem.classList.add(cl)
        })

        elem.addEventListener('click', this.overlayClickListener)

        const rect = new OpenSeadragon.Rect(selection.x, selection.y, selection.w, selection.h, 45)

        // append the new element as overlay, apply scaling factor to dimensions
        this.viewer.addOverlay({
          element: elem,
          location: rect
        })
      })

      // this.anno.selectAnnotation(newZone)
      /* {
        "type": "Annotation",
        "body": [
          {
            "type": "TextualBody",
            "purpose": "tagging",
            "value": "measure"
          }
        ],
        "target": {
          "source": "http://edirom-images.beethovens-werkstatt.de/Scaler/IIIF/bith!00030.jpg",
          "selector": {
            "type": "FragmentSelector",
            "conformsTo": "http://www.w3.org/TR/media-frags/",
            "value": "xywh=pixel:605.5734252929688,1027.3863525390625,1590.9070434570312,804.3912353515625"
          }
        },
        "@context": "http://www.w3.org/ns/anno.jsonld",
        "id": "zbbee1707-1f94-4f9b-a08a-f0a325126fc9"
      } */

      /* if (pageObj.measuresUri !== 'undefined') {
        // retrieve JSON file with IIIF annotations for measure bboxes as Promise
        fetch(pageObj.measuresUri)
          .then(res => res.json())
          .then(json => {
            // parse retrieved JSON with parseMeasureJson() function
            const measures = parseMeasureJson(json)
            // get scale factor for current page from OSD viewer
            const factor = this.viewer.world.getContentFactor()

            // iterate over measures
            measures.forEach(measure => {
              // create a new <div> element with the measure's ID and a given class
              const bbox = document.createElement('div')
              bbox.id = measure.id
              bbox.classList.add('measure')

              // append the new element as overlay, apply scaling factor to dimensions
              this.viewer.addOverlay({
                element: bbox,
                x: measure.x / factor,
                y: measure.y / factor,
                width: measure.w / factor,
                height: measure.h / factor
              })
            })
          })
      } */
    },

    /**
     * called when the user clicks on a selection overlay
     * @param  {[type]} e               [description]
     * @return {[type]}   [description]
     */
    overlayClickListener: function (e) {
      console.log('clicked overlay', e)
      const elem = e.target
      const extractID = elem.getAttribute('data-extracts').split(' ')[0]
      const selectionID = elem.getAttribute('data-selection-id')
      console.log('extract: ' + extractID)
      this.$store.dispatch('activateThing', { id: extractID, type: bithTypes.extract })
      this.$store.dispatch('activateThing', { id: selectionID, type: bithTypes.selection })
    },

    /**
     * a function that is called whenever pages are turned. Calls the preparePage() function
     * @param  {[type]} obj               [description]
     * @return {[type]}     [description]
     */
    pageFlipListener: function (obj) {
      const currentPage = this.viewer.currentPage()
      this.currentImageUri = this.facsimileInfo[currentPage].imageUri.replace('/info.json', '')
      this.$store.dispatch('announceCurrentPage', { viewIndex: this.index, pageUri: this.currentImageUri, pageN: currentPage })

      this.preparePage()
    },

    /**
     * called when user has finished drawing a rectangle
     * @param  {[type]} selection               [description]
     * @return {[type]}           [description]
     */
    createSelectionListener: async function (selection) {
      // The user has created a new shape...

      // it is necessary to have some type of body, or it will not save
      selection.body = [{
        type: 'TextualBody',
        purpose: 'tagging',
        value: 'measure'
      }]

      await this.anno.updateSelected(selection)
      this.anno.saveSelected()
    },

    /**
     * automatically called by createSelectionListener
     * @param  {[type]} annotation               [description]
     * @return {[type]}            [description]
     */
    createAnnotationListener: function (annotation) {
      // The users has created a new annotation
      const newId = 'z' + uuid()
      annotation.id = newId

      console.log('\n\ncreated new annotation: ')
      console.log(annotation)

      const imageUri = annotation.target.source
      const xywh = annotation.target.selector.value.substr(11).split(',')

      const x = Math.round(xywh[0])
      const y = Math.round(xywh[1])
      const w = Math.round(xywh[2])
      const h = Math.round(xywh[3])

      const imageApiCall = '/' + x + ',' + y + ',' + w + ',' + h + '/full/0/default.jpg'
      const targetUri = imageUri + imageApiCall

      this.$store.dispatch('addFacsimileSelection', targetUri)
      console.log('storing ' + targetUri)

      // this.$store.dispatch('createZone', annotation)
      // this.$store.dispatch('selectZone', null)
      // this.anno.clearAnnotations()
      // this.renderZones()
    },

    /**
     * called when annotations are updated
     * @param  {[type]} annotation               [description]
     * @return {[type]}            [description]
     */
    updateAnnotationListener: function (annotation) {
      console.log('updated existing annotation')
      console.log(annotation)

      const xywh = annotation.target.selector.value.substr(11).split(',')
      const x = Math.round(xywh[0])
      const y = Math.round(xywh[1])
      const w = Math.round(xywh[2])
      const h = Math.round(xywh[3])
      console.log('x: ' + x + ', y: ' + y + ', w: ' + w + ', h: ' + h)
    }
  },
  mounted: function () {
    fetch(this.uri)
      .then(res => res.json())
      .then(manifest => {
        // parse IIIF manifest with parseManifest() function, store results in facsimileInfo1
        this.manifest = manifest
        this.facsimileInfo = this.parseManifest(manifest)

        const tileSources = []
        this.facsimileInfo.forEach(page => {
          tileSources.push({
            tileSource: page.imageUri,
            width: page.width,
            // height: page.height,
            x: 0,
            y: 0
          })
        })

        /**
         * Settings for OpenSeadragon.
         * @type {Object}
         */
        const osdConfig = {
          id: this.containerID,
          preserveViewport: false,
          visibilityRatio: 0.1, // allow extreme scroll, but not so much it disappears
          sequenceMode: true,
          showNavigator: false,
          zoomInButton: 'zoomIn_' + this.idSeed,
          zoomOutButton: 'zoomOut_' + this.idSeed,
          previousButton: 'prevPage_' + this.idSeed,
          nextButton: 'nextPage_' + this.idSeed,
          showHomeControl: false,
          showFullPageControl: false,
          gestureSettingsMouse: {
            clickToZoom: false
          },
          silenceMultiImageWarnings: true,
          constrainDuringPan: true,
          tileSources
        }

        /**
         * The OpenSeadragon instance
         * @type {[type]}
         */
        this.viewer = OpenSeadragon(osdConfig)

        // pageFlip listener is added
        this.viewer.addHandler('page', this.pageFlipListener)

        /**
         * Settings for Annotorious
         * @type {Object}
         */
        const annotConfig = {
          disableEditor: true,
          readOnly: !this.isLoggedIn
        }

        /**
         * The Annotorious instance
         * @type {[type]}
         */
        this.anno = Annotorious(this.viewer, annotConfig)

        // the following is only necessary when trying to use the webannots
        this.anno.setAuthInfo({
          id: this.userId,
          displayName: this.userName
        })

        Toolbar(this.anno, document.getElementById('toolbar_' + this.idSeed))

        /**
         * user has drawn a rectangle
         * @type {Array}
         */
        this.anno.on('createSelection', this.createSelectionListener)

        /**
         * new annotation, automatically created from createSelection event
         * @type {String}
         */
        this.anno.on('createAnnotation', this.createAnnotationListener)

        /**
         * called when annotations are updated
         * @type {String}
         */
        this.anno.on('updateAnnotation', this.updateAnnotationListener)

        this.anno.on('selectAnnotation', (annotation, element) => {
          console.log('selected annotation:')
          console.log(annotation)
          console.log(element)
        })

        this.$store.watch((state, getters) => getters.problem1(this.index),
          (newVal, oldVal) => {
            console.log('PROBLEM WATCHER CALLING ' + newVal)
          })

        this.unwatchSelectionsOnPage = this.$store.watch((state, getters) => getters.facsimileSelectionsByViewIndex(this.index), // this.currentImageUri),
          (newArr, oldArr) => {
            this.preparePage()
          })

        const currentPage = this.viewer.currentPage()
        this.currentImageUri = this.facsimileInfo[currentPage].imageUri.replace('/info.json', '')
        this.$store.dispatch('announceCurrentPage', { viewIndex: this.index, pageUri: this.currentImageUri, pageN: currentPage })

        // after initialisizing the viewer, the first page is prepared (measures loaded)
        this.preparePage()
      })
  },
  beforeUnmount () {
    this.unwatchSelectionsOnPage()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

.a9s-annotationlayer .a9s-osd-annotationlayer {
  display: none;
}

.facsimileBox {
  position: relative;
  width: 100%;
  height: 100%;

  .buttonBox {
    position: absolute;
    z-index: 1  ;
    top: 0;
    left: 0;
    right: 0;
    height: 2rem;
    text-align: left;

    .buttonRow {
      display: inline-block;
      background-color: rgba(255,255,255,.6);
      backdrop-filter: blur(5px);

      &.userButtons {
        position: relative;
        top: -6px;
      }

      &.extraButtons {
        height: 38px;

        &.invis {
          display: none;
        }

        button.polygon {
          display: none;
        }
      }

      .facsButton {
        display: inline-block;
        margin: .2rem;
        padding: .2rem .4rem;

        &:hover {
          background-color: rgba(0,0,0,0.06);
        }
      }

      .a9s-toolbar-btn {
        height: 39px;
        margin: 0;
      }
    }
  }

  .iiifContainer {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .overlay.selection {
    background-color: transparentize($svgSelection, .6);
    z-index: 1;
    cursor: pointer;

    &.activeExtract {
      background-color: transparentize($svgCurrentExtract, .6);
    }

    &.activeSelection {
      background-color: transparentize($svgCurrentSelection, .6);
    }
  }
  // from here
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
  // till here
}

</style>
