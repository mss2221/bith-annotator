<template>
  <div class="facsimileBox">
    <div class="buttonBox">
      <div class="userButtons buttonRow">
        <div class="facsButton zoomOut" :id="'zoomOut_' + idSeed"><i class="icon icon-minus"></i></div>
        <div class="facsButton zoomIn" :id="'zoomIn_' + idSeed"><i class="icon icon-plus"></i></div>
        <div class="facsButton prevPage" :id="'prevPage_' + idSeed"><i class="icon icon-arrow-left"></i></div>
        <div class="facsButton nextPage" :id="'nextPage_' + idSeed"><i class="icon icon-arrow-right"></i></div>
      </div>
      <div v-if="isLoggedIn" class="extraButtons buttonRow" :id="'toolbar_' + idSeed"></div>
    </div>

    <div v-bind:id="'iiifContainer_' + idSeed" class="iiifContainer">

    </div>
  </div>

</template>

<script>
//import verovio from 'verovio'
import OpenSeadragon from 'openseadragon'
import * as Annotorious from '@recogito/annotorious-openseadragon'
import Toolbar from '@recogito/annotorious-toolbar'

import '@recogito/annotorious-openseadragon/dist/annotorious.min.css'



export default {
  name: 'Facsimile',
  props: {
    manifest: String,
    idSeed: String
  },
  computed: {
    isLoggedIn: function() {
      return this.$store.getters.isLoggedIn
    },
    userId: function() {
      return this.$store.getters.solidId
    },
    userName: function() {
      return this.$store.getters.solidUser
    }
  },
  methods: {

  },
  mounted: function () {

    /*
     * This function sets up a viewer.
     * param id: the ID of an HTML element where the OSD viewer will be placed
     * param pageArr: an array with page descriptions, as generated with parseManifest() function
     * return viewer: returns the OSD viewer instance
     */
    let createViewer = (id, pageArr) => {

      // extract an array with just the tileSources
      let tileSources = []
      pageArr.forEach(page => {
        tileSources.push(page.imageUri)
      })

      // initialize the viewer
      let viewer = OpenSeadragon({
        id: id,
        prefixUrl: 'openseadragon/images/',
        zoomInButton: 'zoomIn_' + this.idSeed,
        zoomOutButton: 'zoomOut_' + this.idSeed,
        previousButton: 'prevPage_' + this.idSeed,
        nextButton: 'nextPage_' + this.idSeed,
        sequenceMode: true,
        //debugMode: true,
        defaultZoomLevel:	1,
        visibilityRatio: 0.1, // allow extreme scroll, but not so much it disappears
        constrainDuringPan: true,
        tileSources
      });

      // a function that is called whenever pages are turned. Calls the preparePage() function
      let pageFlipListener = (obj) => {
        let viewer = obj.eventSource
        let i = obj.page
        let pageObj = obj.userData[i]

        preparePage(pageObj, viewer)
      }

      // pageFlip listener is added, and gets passed the array with page infos
      viewer.addHandler('page',pageFlipListener, pageArr)

      // after initialisizing the viewer, the first page is prepared (measures loaded)
      preparePage(pageArr[0], viewer)

      // set configuration for annotorious
      const annotConfig = {
        locale: 'auto',
        allowEmpty: true,
        widgets: [
          'COMMENT'
        ]
      }; // Optional plugin config options


      let anno = Annotorious(viewer, annotConfig)
      console.log('trying to set user: ' + this.userId)
      anno.setAuthInfo({
        id: this.userId,
        displayName: this.userName
      });

      //let anno = OpenSeadragon.Annotorious(viewer, annotConfig)

      let sampleAnnotation = {
        "@context": "http://www.w3.org/ns/anno.jsonld",
        "id": "#07475897-d2eb-4dce-aa12-ecb50771c734",
        "type": "Annotation",
        "body": [{
          "type": "TextualBody",
          "value": "Annotation"
        }],
        "target": {
          "selector": {
            "type": "FragmentSelector",
            "conformsTo": "http://www.w3.org/TR/media-frags/",
            "value": "xywh=540,240,180,340"
          }
        }
      }

      Toolbar(anno, document.getElementById('toolbar_' + this.idSeed));



      // anno.addAnnotation(sampleAnnotation);

      // anno.loadAnnotations('http://localhost:8080/annotations.w3c.json');

      anno.on('createAnnotation', (a) => {
        console.log('created a new annotation')
        console.log(a)

        let xywh = a.target.selector.value.substr(11).split(',')

        let x = Math.round(xywh[0])
        let y = Math.round(xywh[1])
        let w = Math.round(xywh[2])
        let h = Math.round(xywh[3])
        console.log('x: ' + x + ', y: ' + y + ', w: ' + w + ', h: ' + h)
      })

      anno.on('updateAnnotation', (a) => {
        console.log('updated existing annotation')
        console.log(a)

        let xywh = a.target.selector.value.substr(11).split(',')
        let x = Math.round(xywh[0])
        let y = Math.round(xywh[1])
        let w = Math.round(xywh[2])
        let h = Math.round(xywh[3])
        console.log('x: ' + x + ', y: ' + y + ', w: ' + w + ', h: ' + h)
      })

      anno.on('selectAnnotation', (annotation, element) => {
        console.log('selected annotation:')
        console.log(annotation)
        console.log(element)
      });

      //return the viewer for later reference / use
      return viewer
    }

    /*
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
    let parseManifest = (manifest) => {
      //create an empty array that will hold details for every page
      let arr = []
      // iterate over the manifest canvas sequence. This is simplifying, in that it makes rather assumptions on the manifest. Probably ok for our own manifests, though.
      manifest.sequences[0].canvases.forEach((canvas,ci) => {

        // get link to IIIF Image API info.json file. If necessary, append '/info.json'
        let imageUri = canvas.images[0].resource.service['@id']
        imageUri = imageUri.endsWith('/info.json') ? imageUri : imageUri + '/info.json'

        // get otherContent prop and retrieve link to measure zones. This makes _very_ strong assumptions!
        let otherContent = canvas.otherContent
        let measuresUri = otherContent.find(item => {
          let ocId = item.within['@id']
          let endsWith = (ocId === 'undefined') ? false : ocId.endsWith('/measureZones')
          return endsWith
        })
        if(typeof measuresUri !== 'undefined') {
          measuresUri = measuresUri['@id']
        }

        // retrieve some basic props for each page
        let label = canvas.label
        let width = canvas.images[0].resource.width
        let height = canvas.images[0].resource.height

        // create an object with all the retrieved infos
        let obj = {
          imageUri,
          measuresUri,
          label,
          width,
          height
        }

        // push the object to the array
        arr.push(obj)
      })
      // return the array
      return arr
    }

    /*
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
    let parseMeasureJson = (json) => {
      // create empty array to hold details about each measure
      let arr = []
      // iterate over all measures
      let measures = json.resources.forEach(iiifAnnot => {
        // the ID is the last part of the URI, after the final slash
        let id = iiifAnnot['@id'].split('/').slice(-1)[0]
        // create an array with xywh values after extracting the right part of the xywh= string
        let xywh = iiifAnnot.on.selector.value.substr(5).split(',')
        let x = xywh[0]
        let y = xywh[1]
        let w = xywh[2]
        let h = xywh[3]
        let label = iiifAnnot.resource.chars
        // create an obj with all extracted props
        let obj = {
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
    }

    /*
     * This function loads additional stuff for a page *after* it is displayed by OSD.
     * Used to load measures, but also annotations (if any)
     * param pageObj: The object, as generated by parseMeasureJson()
     */
    let preparePage = (pageObj, viewer) => {

      // only do something when there is a link to measure bboxes for the current page
      if(pageObj.measuresUri !== 'undefined') {

        // retrieve JSON file with IIIF annotations for measure bboxes as Promise
        fetch(pageObj.measuresUri)
          .then(res => res.json())
          .then(json => {

            // parse retrieved JSON with parseMeasureJson() function
            let measures = parseMeasureJson(json)
            // get scale factor for current page from OSD viewer
            let factor = viewer.world.getContentFactor()
            // iterate over measures
            measures.forEach(measure => {

              // create a new <div> element with the measure's ID and a given class
              let bbox = document.createElement('div')
              bbox.id = measure.id
              bbox.classList.add('measure')

              // append the new element as overlay, apply scaling factor to dimensions
              viewer.addOverlay({
                element: bbox,
                x: measure.x / factor,
                y: measure.y / factor,
                width: measure.w / factor,
                height: measure.h / factor
              })
            })
          })
      }
    }

    // create empty variables for first viewer – array with image details, and viewer
    let facsimileInfo
    let viewer

    // retrieve IIIF manifest and translate to JSON
    fetch('https://api.beethovens-werkstatt.de/iiif/document/r7cb7bbab-5d48-40be-a56f-b77402ee3fb9/manifest.json')
    // fetch('https://api.domestic-beethoven.eu/iiif/document/facsKlv/manifest.json')
      .then(res => res.json())
      .then(manifest => {

        // parse IIIF manifest with parseManifest() function, store results in facsimileInfo1
        facsimileInfo = parseManifest(manifest)
        // set up viewer
        viewer = createViewer('iiifContainer_' + this.idSeed, facsimileInfo)

      })

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.facsimileBox {
  position: relative;
  width: 100%;
  height: 100%;

  .buttonBox {
    position: absolute;
    z-index: 10000;
    top: 0;
    left: 0;
    right: 0;
    height: 2rem;
    text-align: left;

    .buttonRow {
      display: inline-block;
      background-color: rgba(255,255,255,.8);
      backdrop-filter: blur(5px);

      &.userButtons {
        position: relative;
        top: -6px;
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
}

</style>
