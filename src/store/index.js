/**
  The data setup of this App is rather *special* ;-)
  While the bith-annotator app is based on Vue, and
  uses Vuex for state management accordingly, it relies
  on the MELD-Clients-Core library, which is based on
  React and Redux. In order to use that existing code
  as much as possible, bith-annotator uses a separate
  Redux store, which is called *meldStore* in this
  context. It is set up with the *initMeld()* action,
  which needs to be dispatched after app start. It
  subscribes to changes to the MELD redux store
  (triggered by MELD's own code for graph traversal),
  and "forwards" appropriate actions to the Vuex store.
  Vue components never interface with the MELD code
  directly, but only through the regular store getters.
 */
import Vue from 'vue'
import Vuex from 'vuex'

// External Dependencies for MELD Redux Store
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'

// generic tool
import { v4 as uuidv4 } from 'uuid'

// Dependencies for MELD
import { registerTraversal, traverse, setTraversalObjectives, checkTraversalObjectives } from 'meld-clients-core/lib/actions/index'
import { prefix as pref } from './../meld/prefixes'// 'meld-clients-core/lib/library/prefixes'
// import { fetchGraph } from 'meld-clients-core/lib/actions/index'
import GraphReducer from 'meld-clients-core/lib/reducers/reducer_graph'
import TraversalPoolReducer from 'meld-clients-core/lib/reducers/reducer_traversalPool'

// Some Constants separated out from MELD (too lazy to import all of those individually)
// import constants from '../meld/constants.js'

// Helper functions for MELD, which were part of the local StarBrightlyShining code
import { transformArrangement, addWork } from '../meld/functions.js'

// temporary shortcut to ensure a proper graph, while traversing is still being worked on
import { staticWorklist, staticArrangements } from './fakedata.js'

// setup for the graph to be traversed in this app
import { graphURI, params, traversalObjectives, MAX_TRAVERSERS } from './../../config/traversal.config.js'

// SolidPOD authentication library
/* import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch
} from '@inrupt/solid-client-authn-browser' */

// Import from "@inrupt/solid-client"
import {
  getSolidDataset,
  createSolidDataset,
  saveSolidDatasetAt,
  createThing,
  buildThing,
  setThing,
  getThing,
  getThingAll,
  getFile,
  isRawData,
  getContentType,
  getSourceUrl,
  overwriteFile,
  getStringNoLocale,
  getUrlAll,
  getUrl,
  addUrl,
  addStringNoLocale,
  setStringNoLocale
} from '@inrupt/solid-client'

import * as jsonld from 'jsonld'

// Import Verovio
import verovio from 'verovio'
// import { vrvPresets } from './../../config/verovio.config.js'

/*******************************************/
/* BEGIN REDUX SETUP FOR MELD-CLIENTS-CORE */
const rootReducer = combineReducers({
  graph: GraphReducer,
  traversalPool: TraversalPoolReducer
})

// creating MELD Redux Store
const meldStore = createStore(rootReducer, applyMiddleware(thunk))
console.log('MELD: Initial State', meldStore.getState())
/* END REDUX SETUP FOR MELD-CLIENTS-CORE */

Vue.use(Vuex)

/* BEGIN SOLIDPOD SETUP */

/* END SOLIDPOD SETUP */

/* BEGIN VEROVIO SETUP */

let vrvToolkit
verovio.module.onRuntimeInitialized = () => {
  // eslint-disable-next-line
  vrvToolkit = new verovio.toolkit()
}

/* END VEROVIO SETUP */

const graphComponentDidUpdate = (props, prevProps) => {
  // Boiler plate traversal code (should move to m-c-c)
  // Check whether the graph has updated and trigger further traversal as necessary.
  const prevPool = prevProps.traversalPool
  const thisPool = props.traversalPool
  let updated = false
  if (prevPool.running === 1 && thisPool.running === 0) {
    // check our traversal objectives if the graph has updated
    // console.error('checkTraversalObjectives()', props.graph.graph, props.graph.objectives)
    meldStore.dispatch(checkTraversalObjectives(props.graph.graph, props.graph.objectives))
    updated = true
  } else if (Object.keys(thisPool.pool).length && thisPool.running < MAX_TRAVERSERS) {
    // Initiate next traverser in pool...
    const arr = Object.keys(thisPool.pool)
    const uri = arr[arr.length - 1]
    // console.warn('next traverse()', uri, thisPool.pool[uri])
    meldStore.dispatch(traverse(uri, thisPool.pool[uri]))
    // console.log('\n__traversing next')
    // console.log('yodeyay – has was:' + prevProps.graph.outcomesHash + ', is now: ' + props.graph.outcomesHash)
    if (prevProps.graph.outcomesHash !== props.graph.outcomesHash) {
      updated = true
    }
  } else if (props.traversalPool.running === 0) {
    if (prevProps.graph.outcomesHash !== props.graph.outcomesHash) {
      updated = true
    }
  }
  return updated
}

const graphHasChanged = (graph, commit) => {
  let arrangements = []
  let worklist = []

  // console.log('graphHasChanged', graph)

  // 0. Get arrangements
  if (graph.graph && graph.graph.outcomes &&
     graph.graph.outcomes[0] &&
     graph.graph.outcomes[0]['@graph'] &&
     graph.graph.outcomes[0]['@graph'].length) {
    // TODO: This isn't working
    arrangements = graph.graph.outcomes[0]['@graph'].map(transformArrangement)
    // Extract all unique works from the arrangements list
    worklist = arrangements.reduce(addWork, [])
  }
  // 1. convert this.graph.outcomes[0] into this.state.worklist

  commit('SET_ARRANGEMENTS', arrangements)
  commit('SET_WORKLIST', worklist)
}

// creates an annotation stub
const getAnnotDS = (state) => {
  const user = state.solidSession.info.webId
  const date = new Date()
  // const date = d.toISOString()
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/annotations/' + plainId + '.ttl'

  let ds = createSolidDataset()

  const thing = buildThing(createThing({ name: id }))
    .addStringNoLocale(pref.rdf + 'type', 'Annotation')
    .addDate(pref.dct + 'created', date)
    .addStringNoLocale(pref.dct + 'creator', user)
    .addStringNoLocale(pref.oa + 'Motivation', 'describing')
    .addStringNoLocale(pref.oa + 'bodyValue', '')
    // .addUrl(pref.frbr + 'embodiment','http://test1.com/ads')
    // .addUrl(pref.frbr + 'embodiment','http://test2.com/sad')
    .build()

  ds = setThing(ds, thing)

  return ds

  /* const anno = {
    "@context": "http://www.w3.org/ns/anno.jsonld",
    "@id": id,
    "http://purl.org/dc/terms/created": date,
    "http://purl.org/dc/terms/creator": user,
    "type": "Annotation",
    "motivation": "describing",
    "body": {
      "type": "TextualBody",
      "value": ""
    },
    "target": null
  } */
}

// creates a musicalMaterial stub
const getMusMatDS = (state) => {
  const user = state.solidSession.info.webId
  const date = new Date()
  // const date = d.toISOString()
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/musicalMaterials/' + plainId + '.ttl'

  let ds = createSolidDataset()

  const thing = buildThing(createThing({ name: id }))
    .addUrl(pref.rdf + 'type', 'https://example.com/Terms/MusicalMaterial')
    .addDate(pref.dct + 'created', date)
    .addStringNoLocale(pref.dct + 'creator', user)
    .addStringNoLocale(pref.rdfs + 'label', '')
    // .addUrl(pref.frbr + 'embodiment','http://test1.com/ads')
    // .addUrl(pref.frbr + 'embodiment','http://test2.com/sad')
    .build()

  ds = setThing(ds, thing)

  return ds
}

const getExtractDS = (state) => {
  const user = state.solidSession.info.webId
  const date = new Date()
  // const date = d.toISOString()
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/extracts/' + plainId + '.ttl'

  let ds = createSolidDataset()

  const thing = buildThing(createThing({ name: id }))
    .addUrl(pref.rdf + 'type', 'https://example.com/Terms/Extract')
    .addDate(pref.dct + 'created', new Date())
    .addStringNoLocale(pref.dct + 'creator', user)
    .addStringNoLocale(pref.rdfs + 'label', '')
    // * .addUrl(pref.frbr + 'member','http://test1.com/ads')
    // * .addUrl(pref.frbr + 'member','http://test2.com/sad')
    .build()

  ds = setThing(ds, thing)

  return ds

  /* const extract = {
    "@type": "https://example.com/Terms/Extract",
    "@id": id,
    "http://purl.org/dc/terms/created": date,
    "http://purl.org/dc/terms/creator": user,
    "https://www.w3.org/2000/01/rdf-schema#label": "",
    * "http://purl.org/vocab/frbr/core#member": []

    * NB: Extract moved to "expression" level, so its Selections are "embodiments"
       http://purl.org/vocab/frbr/core#embodiment

  } */
}

const getSelectionDS = (state) => {
  const user = state.solidSession.info.webId
  const date = new Date()
  // const date = d.toISOString()
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/selections/' + plainId + '.ttl'

  let ds = createSolidDataset()

  const thing = buildThing(createThing({ name: id }))
    .addUrl(pref.rdf + 'type', 'https://example.com/Terms/Selection')
    .addDate(pref.dct + 'created', new Date())
    .addStringNoLocale(pref.dct + 'creator', user)
    .addStringNoLocale(pref.rdfs + 'label', '')
    // .addUrl(pref.frbr + 'part','http://test1.com/ads')
    // .addUrl(pref.frbr + 'part','http://test2.com/sad')
    .build()

  ds = setThing(ds, thing)

  return ds

  /* const selection = {
    "@type": "https://example.com/Terms/Selection",
    "@id": id,
    "http://purl.org/dc/terms/created": date,
    "http://purl.org/dc/terms/creator": user,
    "https://www.w3.org/2000/01/rdf-schema#label": "–",
    "http://purl.org/vocab/frbr/core#part": []
  } */
}

/**
 * [getPublicIdFromDataStructure description]
 * @param  {[type]} ds               [description]
 * @return {[type]}    [description]
 */
const getPublicIdFromDataStructure = (ds) => {
  const url = getThingAll(ds)[0].url
  if (url.indexOf('.well-known/sdk-local-node/') !== -1) {
    return url.split('.well-known/sdk-local-node/')[1]
  } else if (url.indexOf('#') !== -1) {
    return url.split('#')[0]
  } else {
    return url
  }
}

/**
 * [loadListing description]
 * @param  {[type]} listingPath               [description]
 * @param  {[type]} commit                    [description]
 * @return {[type]}             [description]
 */
const loadListing = async (listingPath, commit, authFetch) => {
  const listing = await getSolidDataset(
    listingPath, // File in Pod to Read
    { fetch: authFetch } // fetch from authenticated session
  )
  commit('SET_SOLID_FILE_LISTING', listing)

  const thing = getThingAll(listing)[0]
  const uris = getUrlAll(thing, pref.ldp + 'contains')
  console.log('Listing exists at ' + listingPath + ' exists. \nNeed to retrieve the following URIs:', uris)

  uris.forEach(async uri => {
    const ds = await getSolidDataset(
      uri, // File in Pod to Read
      { fetch: authFetch } // fetch from authenticated session
    )
    const thing = getThingAll(ds)[0]
    const type = getUrl(thing, pref.rdf + 'type')
    const annotType = getStringNoLocale(thing, pref.rdf + 'type')

    let internalType
    // todo: no support for annotations yet
    if (annotType === 'Annotation') {
      commit('ADD_TO_ANNOTSTORE', { type: 'observation', object: ds })
    } else if (type === 'https://example.com/Terms/MusicalMaterial') {
      commit('ADD_TO_ANNOTSTORE', { type: 'musicalMaterial', object: ds })
    } else if (type === 'https://example.com/Terms/Extract') {
      commit('ADD_TO_ANNOTSTORE', { type: 'extract', object: ds })
    } else if (type === 'https://example.com/Terms/Selection') {
      commit('ADD_TO_ANNOTSTORE', { type: 'selection', object: ds })
    } else {
      // console.log('\n\n\nFound something strange: ', type, annotType, ds)
    }
  })
}

export default new Vuex.Store({
  state: {
    graph: {},
    arrangements: [],
    worklist: [],
    views: [],
    perspective: 'landingPage',
    solidSession: null,
    solidUser: null,
    solidFileListing: null,
    solidFileListingPath: null,
    annotStore: {
      observation: {},
      musicalMaterial: {},
      extract: {},
      selection: {}
    },
    currentAnnot: {
      observation: {},
      musicalMaterial: {},
      extract: {},
      selection: {}
    },
    currentObservation: null,
    currentMusMat: null,
    currentExtract: null,
    currentSelection: null,
    editing: null,
    selectionModeActive: false,
    showDebugOverlay: false
  },
  mutations: {
    ADD_VIEW (state, view) {
    // TODO: think about how to deal with more than 2 views
      state.views = state.views.concat([view])
      console.log('added new view:', view)
    },

    REMOVE_VIEW (state, index) {
      let arr = [...state.views]
      arr.splice(index, 1)

      Vue.set(state,'views',arr)
    },
    REMOVE_ALL (state) {

    },
    SET_GRAPH (state, graph) {
      state.graph = graph
    },
    SET_ARRANGEMENTS (state, arrangements) {
      state.arrangements = arrangements

      const meiLinks = []
      arrangements.forEach(arr => {
        meiLinks.push(arr.MEI)
      })
    },
    SET_WORKLIST (state, worklist) {
      state.worklist = worklist
    },
    SET_PERSPECTIVE (state, perspective) {
      const perspectives = ['landingPage', 'library', 'workbench']
      if (perspectives.indexOf(perspective) !== -1) {
        state.perspective = perspective
      }
    },
    SET_SOLID_SESSION (state, session) {
      state.solidSession = session
    },
    SET_SOLID_USERNAME (state, username) {
      state.solidUser = username
    },
    SET_SOLID_FILE_LISTING (state, listing) {
      state.solidFileListing = listing
    },
    SET_SOLID_LISTING_PATH (state, listingPath) {
      state.solidFileListingPath = listingPath
    },
    ADD_FILE_TO_SOLID_FILE_LISTING (state, uri) {
      console.log('trying to add ' + uri)
      const existingIndex = state.solidFileListing['http://www.w3.org/ns/ldp#contains'].findIndex(item => {
        return item['@id'] === uri
      })
      console.log('index is ' + existingIndex)
      if (existingIndex === -1) {
        const obj = {}
        obj['@id'] = uri
        state.solidFileListing['http://www.w3.org/ns/ldp#contains'].push(obj)
      }
      console.log(state.solidFileListing)
    },
    REMOVE_FILE_FROM_SOLID_FILE_LISTING (state, uri) {
      const existingIndex = state.solidFileListing['http://www.w3.org/ns/ldp#contains'].findIndex(item => {
        return item['@id'] === uri
      })
      if (existingIndex !== -1) {
        state.solidFileListing['http://www.w3.org/ns/ldp#contains'].splice(existingIndex, 1)
      }
    },
    ADD_TO_ANNOTSTORE (state, payload) {
      const type = payload.type
      const obj = payload.object
      const id = getPublicIdFromDataStructure(obj)

      if (type in state.annotStore) {
        Vue.set(state.annotStore[type], id, obj)
      }
    },
    MOVE_TO_CURRENT_ANNOT (state, payload) {
      const type = payload.type
      const obj = payload.object
      const id = getPublicIdFromDataStructure(obj)

      if (type in state.annotStore && !(id in state.currentAnnot[type])) {
        Vue.set(state.currentAnnot[type], id, obj)
      }
    },
    REMOVE_FROM_CURRENT_ANNOT (state, payload) {
      const type = payload.type
      const obj = payload.object
      const id = getPublicIdFromDataStructure(obj)

      if (type in state.annotStore && id in state.currentAnnot[type]) {
        Vue.delete(state.currentAnnot[type], id, obj)
      }
    },
    REMOVE_FROM_ANNOTSTORE (state, payload) {
      const type = payload.type
      const obj = payload.object
      const id = getPublicIdFromDataStructure(obj)

      if (type in state.annotStore) {
        Vue.delete(state.annotStore[type], id)
      }
    },
    ADD_TO_CURRENT_ANNOT (state, payload) {
      const type = payload.type
      const id = payload.id
      const prop = payload.prop
      const method = payload.method
      const val = payload.val

      let ds = state.currentAnnot[type][id]
      let thing = getThingAll(ds)[0]

      if (method === 'addStringNoLocale') {
        thing = buildThing(thing)
          .addStringNoLocale(prop, val)
          .build()
      } else if (method === 'setStringNoLocale') {
        thing = buildThing(thing)
          .setStringNoLocale(prop, val)
          .build()
      } else if (method === 'addUrl') {
        thing = buildThing(thing)
          .addUrl(prop, val)
          .build()
      } else if (method === 'setUrl') {
        thing = buildThing(thing)
          .setUrl(prop, val)
          .build()
      } else if (method === 'removeUrl') {
        thing = buildThing(thing)
          .removeUrl(prop, val)
          .build()
      } else if (method === 'addDate') {
        thing = buildThing(thing)
          .addDate(prop, val)
          .build()
      } else {
        console.error('Unknown operation: ' + method)
      }

      ds = setThing(ds, thing)

      Vue.set(state.currentAnnot[type], id, ds)
    },
    /* REMOVE_FROM_CURRENT_ANNOT (state, payload) {
      const type = payload.type
      const obj = payload.object

      if(type in state.currentAnnot) {
        Vue.delete(state.currentAnnot[type], obj['@id'])
      }
    }, */
    TOGGLE_DEBUG_OVERLAY (state) {
      state.showDebugOverlay = !state.showDebugOverlay
    },
    SET_EDITING (state, mode) {
      // already there
      if (state.editing === mode) {
        return true
      }

      if (mode === null) {
        Vue.set(state, 'currentAnnot', {
          observation: {},
          musicalMaterial: {},
          extract: {},
          selection: {}
        })
        state.editing = mode
        state.selectionModeActive = false
        state.currentObservation = null
        state.currentMusMat = null
        state.currentExtract = null
        state.currentSelection = null
      } else if (mode === 'parallelPassage') {
        // starting new parallel passage
        if (state.currentMusMat === null) {
          const ds = getMusMatDS(state)
          const id = getPublicIdFromDataStructure(ds)

          /* saveSolidDatasetAt(
            stub['@id'],
            musMatDataset,
            {
              fetch: state.solidSession.fetch
            }
          ).then(res => {
            console.log('sucessfully stored? at ' + stub['@id'], res)
          }) */

          const musMat = {}
          musMat[id] = ds

          Vue.set(state, 'currentAnnot', {
            observation: {},
            musicalMaterial: musMat,
            extract: {},
            selection: {}
          })
          state.editing = mode
          state.selectionModeActive = false
          state.currentObservation = null
          state.currentMusMat = id
          state.currentExtract = null
          state.currentSelection = null
        } else {
          // opening existing parallel passage
          const mm = {}
          const ex = {}
          const sel = {}

          const id = state.currentMusMat
          const ds = state.annotStore.musicalMaterial[id]

          mm[id] = ds

          const thing = getThingAll(ds)[0]
          const extracts = getUrlAll(thing, pref.frbr + 'embodiment')

          extracts.forEach(extractId => {
            const extract = state.annotStore.extract[extractId]

            ex[extractId] = extract

            const exThing = getThingAll(extract)[0]
            const selections = getUrlAll(exThing, pref.frbr + 'embodiment')

            selections.forEach(selectionId => {
              const selection = state.annotStore.selection[selectionId]
              sel[selectionId] = selection
            })
          })

          Vue.set(state, 'currentAnnot', {
            observation: {},
            musicalMaterial: mm,
            extract: ex,
            selection: sel
          })

          state.editing = mode
          state.selectionModeActive = false
          state.currentObservation = null
          state.currentExtract = null
          state.currentSelection = null
        }
      } else if (mode === 'observation') {
        // starting new observation
        if (state.currentObservation === null) {
          const ds = getAnnotDS(state)
          const id = getPublicIdFromDataStructure(ds)

          const observation = {}
          observation[id] = ds

          Vue.set(state, 'currentAnnot', {
            observation: observation,
            musicalMaterial: {},
            extract: {},
            selection: {}
          })
          state.editing = mode
          state.selectionModeActive = false
          state.currentObservation = id
          state.currentMusMat = null
          state.currentExtract = null
          state.currentSelection = null
        } else {
          // opening existing observation
          const ob = {}
          const mm = {}
          const ex = {}
          const sel = {}

          const id = state.currentObservation
          const ds = state.annotStore.observation[id]

          ob[id] = ds

          const thing = getThingAll(ds)[0]

          const musMatId = getUrl(thing, pref.oa + 'hasTarget')
          const musMat = state.annotStore.musicalMaterial[musMatId]

          mm[musMatId] = musMat
          const mmThing = getThingAll(musMat)[0]
          const extracts = getUrlAll(mmThing, pref.frbr + 'embodiment')

          extracts.forEach(extractId => {
            const extract = state.annotStore.extract[extractId]

            ex[extractId] = extract

            const exThing = getThingAll(extract)[0]
            const selections = getUrlAll(exThing, pref.frbr + 'embodiment')

            selections.forEach(selectionId => {
              const selection = state.annotStore.selection[selectionId]
              sel[selectionId] = selection
            })
          })

          Vue.set(state, 'currentAnnot', {
            observation: ob,
            musicalMaterial: mm,
            extract: ex,
            selection: sel
          })

          state.editing = mode
          state.selectionModeActive = false
          state.currentObservation = id
          state.currentMusMat = null
          state.currentExtract = null
          state.currentSelection = null
        }

        /*
         * stop it here
         */
      }

      /* if([null,'parallelPassage','observation'].indexOf(mode) !== -1) {
        if(state.editing !== mode) {

          let obs = {}
          let musMat = {}
          if(mode === 'parallelPassage') {
            const stub = getMusMatStub(state)
            musMat[stub['@id']] = stub
          }
          if(mode === 'observation') {
            const stub = getAnnotStub(state)
            obs[stub['@id']] = stub
          }

          Vue.set(state, 'currentAnnot', {
            observation: obs,
            musicalMaterial: musMat,
            extract: {},
            selection: {}
          })
          state.editing = mode
          state.selectionModeActive = false
          state.currentExtract = null
          state.currentSelection = null
        }
      } */
    },
    SET_SELECTION_MODE_ACTIVE (state, bool) {
      state.selectionModeActive = bool
      if (!bool) {
        state.currentSelection = null
      }
    },
    ADD_PASSAGE (state) {
      const extract = getExtractDS(state)
      const extractId = getPublicIdFromDataStructure(extract)

      state.currentExtract = extractId

      Vue.set(state.currentAnnot.extract, extractId, extract)

      let musMat = Object.values(state.currentAnnot.musicalMaterial)[0]
      const musMatId = getPublicIdFromDataStructure(musMat)

      let thing = getThingAll(musMat)[0]

      thing = buildThing(thing)
        .addUrl(pref.frbr + 'embodiment', extractId)
        .build()

      musMat = setThing(musMat, thing)

      Vue.set(state.currentAnnot.musicalMaterial, musMatId, musMat)
      state.currentSelection = null
    },
    SET_ACTIVE_MUSMAT (state, id) {
      state.currentMusMat = id
    },
    SET_ACTIVE_OBSERVATION (state, id) {
      state.currentObservation = id
    },
    ACTIVATE_PASSAGE (state, id) {
      state.currentExtract = id
      state.currentSelection = null
    },
    ACTIVATE_SELECTION (state, id) {
      state.currentSelection = id
    },
    ADD_NEW_SELECTION_TO_CURRENT_EXTRACT (state) {
      const selection = getSelectionDS(state)
      const selectionId = getPublicIdFromDataStructure(selection)

      state.currentSelection = selectionId

      Vue.set(state.currentAnnot.selection, selectionId, selection)

      let extractDS = state.currentAnnot.extract[state.currentExtract]
      const extractId = getPublicIdFromDataStructure(extractDS)
      let thing = getThingAll(extractDS)[0]

      thing = buildThing(thing)
        .addUrl(pref.frbr + 'embodiment', selectionId)
        .build()

      extractDS = setThing(extractDS, thing)
      Vue.set(state.currentAnnot.extract, extractId, extractDS)
    },
    TOGGLE_SELECTION (state, id) {
      let selectionDS = state.currentAnnot.selection[state.currentSelection]
      const selectionId = getPublicIdFromDataStructure(selectionDS)
      let thing = getThingAll(selectionDS)[0]

      const urls = getUrlAll(thing, pref.frbr + 'part')

      if (urls.indexOf(id) === -1) {
        thing = buildThing(thing)
          .addUrl(pref.frbr + 'part', id)
          .build()
      } else {
        thing = buildThing(thing)
          .removeUrl(pref.frbr + 'part', id)
          .build()
      }

      selectionDS = setThing(selectionDS, thing)
      Vue.set(state.currentAnnot.selection, selectionId, selectionDS)
    }
  },
  actions: {
    addView ({ commit }, view) {
      commit('ADD_VIEW', view)
    },
    removeView ({ commit }, index) {
      commit('REMOVE_VIEW', index)
    },
    setGraph ({ commit }, graph) {
      commit('SET_GRAPH', graph)
    },
    initMeld ({ commit, state }) {
      console.log('initMeld()')
      // initialize Vuex store with initial Redux graph
      commit('SET_GRAPH', meldStore.getState())
      // listen to changes within MELD Redux
      /* const unsubscribe = */meldStore.subscribe(() => {
        // get old graph from Vuex store
        const prevGraph = state.graph
        // get new graph from Redux store
        const graph = meldStore.getState()

        // copy new graph to Vuex store
        commit('SET_GRAPH', graph)

        // check if additional traversal jobs are necessary
        if (graphComponentDidUpdate(graph, prevGraph)) {
          // error level just to highlight between other console.messages
          // console.error('passed')
          graphHasChanged(graph, commit)
        } else {
          // console.log('not passed')
        }
      })
    },
    setTraversalObjectives ({ commit }) {
      console.log('setTraversalObjectives()')
      meldStore.dispatch(setTraversalObjectives(traversalObjectives))
    },
    traverseGraph ({ commit, state }) {
      // this initiates MELD traversal from within Vue. Called once…
      console.log('starting traverseGraph()')
      const res = meldStore.dispatch(registerTraversal(graphURI, params))
      const newParams = res.payload.params // meldStore.getState().traversalPool.pool[graphURI]
      meldStore.dispatch(traverse(graphURI, newParams))// newParams))
    },
    setPerspective ({ commit }, perspective) {
      commit('SET_PERSPECTIVE', perspective)
    },
    setSolidSession ({ commit }, session) {
      commit('SET_SOLID_SESSION', session)

      try {
        const webId = session.info.webId
        const authFetch = session.fetch

        async function getUserName () {
          const userCard = await getSolidDataset(
            webId, {
              fetch: authFetch
            })

          const profile = getThing(
            userCard,
            webId
          )

          const name = getStringNoLocale(
            profile,
            pref.foaf + 'name'
          )

          commit('SET_SOLID_USERNAME', name)

          const listingPath = webId.split('/profile/card')[0] + '/public/bith/listing.ttl'
          commit('SET_SOLID_LISTING_PATH', listingPath)

          let listing

          try {
            await loadListing(listingPath, commit, authFetch)
          } catch (err) {
            console.log('No listing available at ' + listingPath + '. Creating a new one. \nMessage: ' + err)

            let ds = createSolidDataset()

            const thing = buildThing(createThing({ name: listingPath }))
              .addUrl(pref.rdf + 'type', pref.ldp + 'Container')
              .build()

            ds = setThing(ds, thing)

            saveSolidDatasetAt(
              listingPath,
              ds,
              {
                fetch: authFetch
              }
            ).then(res => {
              console.log('Initialized file listing at ' + listingPath, res)
              commit('SET_SOLID_FILE_LISTING', ds)
            })
          }
        }
        getUserName()

        /*
        const me = rdfStore.sym(webId)
        const profile = me.doc()
        const foaf = new $rdf.Namespace(pref.foaf)
        rdfFetcher.load(profile).then(response => {
          let name = rdfStore.any(me, foaf('name'))
          commit('SET_SOLID_USERNAME', name.value)
        }, err => {
          // console.log('Load failed ' +  err)
        })
        */
      } catch (err) {
        console.log('ERROR retrieving username: ' + err)
      }

      // other approach:

      /* console.log('hello')
      auth.fetch(session.webId, {
        //mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.text())
        .then(data => {
          console.log('\n\n----me here!!!')
          console.log(data)
        })
      console.log('hello 2')
      */
    },
    toggleDebugOverlay ({ commit, state }) {
      commit('TOGGLE_DEBUG_OVERLAY')
    },
    createDataObject ({ commit, state }, payload) {
      if (payload.type in state.annotStore && payload.object) {
        const authFetch = state.solidSession.fetch
        const ds = payload.object
        const uri = getPublicIdFromDataStructure(ds)

        // console.log('trying to create object: ', payload.object)
        try {
          saveSolidDatasetAt(
            uri,
            ds,
            {
              fetch: authFetch
            }
          ).then(res => {
            console.log('successfully uploaded to ' + uri, res)
            // after upload to SolidPod store in Vuex
            commit('ADD_TO_ANNOTSTORE', payload)

            /*
            let selectionDS = state.currentAnnot.selection[state.currentSelection]
            const selectionId = getPublicIdFromDataStructure(selectionDS)
            let thing = getThingAll(selectionDS)[0]

            let urls = getUrlAll(thing,pref.frbr + 'part')

            if(urls.indexOf(id) === -1) {
              thing = buildThing(thing)
                .addUrl(pref.frbr + 'part', id)
                .build()
            } else {
              thing = buildThing(thing)
                .removeUrl(pref.frbr + 'part', id)
                .build()
            }

            selectionDS = setThing(selectionDS, thing)
            Vue.set(state.currentAnnot.selection, selectionId, selectionDS)
            */
          })
        } catch (err) {
          console.error('could not upload to ' + uri, err)
        }
      }
    },
    changeDataObject ({ commit, state }, payload) {
      if (payload.type in state.annotStore && payload.object) {
        // upload to SolidPod, if successful store in Vuex
        commit('ADD_TO_ANNOTSTORE', payload)
      }
    },
    removeDataObject ({ commit, state }, payload) {
      if (payload.type in state.annotStore && payload.object) {
        // delete from SolidPod, if successful store in Vuex
        commit('REMOVE_FROM_ANNOTSTORE', payload)
      }
    },
    addCurrentDataObject ({ commit, state }, payload) {
      if (payload.type in state.currentAnnot && payload.object) {
        commit('MOVE_TO_CURRENT_ANNOT', payload)
        // MOVE_TO_CURRENT_ANNOT
      }
    },
    changeCurrentDataObject ({ commit, state }, payload) {
      if (payload.type in state.currentAnnot && payload.id && payload.prop && payload.method && payload.val) {
        commit('ADD_TO_CURRENT_ANNOT', payload)
      }
    },
    removeCurrentDataObject ({ commit, state }, payload) {
      if (payload.type in state.currentAnnot && payload.object) {
        commit('REMOVE_FROM_CURRENT_ANNOT', payload)
      }
    },
    setEditing ({ commit }, mode) {
      commit('SET_EDITING', mode)
    },
    addPassage ({ commit }) {
      commit('ADD_PASSAGE')
    },
    setActiveObservation ({ commit }, id) {
      commit('SET_ACTIVE_OBSERVATION', id)
    },
    setActiveMusMat ({ commit }, id) {
      commit('SET_ACTIVE_MUSMAT', id)
    },
    setActivePassage ({ commit, state, dispatch }, id) {
      commit('ACTIVATE_PASSAGE', id)
      commit('SET_SELECTION_MODE_ACTIVE', true)
    },
    setObservationTarget ({ commit, state, dispatch }, id) {
      const observations = Object.values(state.currentAnnot.observation)
      if (observations.length === 0) {
        return null
      }
      const currentObservationId = Object.keys(state.currentAnnot.observation)[0]

      const observationDS = observations[0]
      const thing = getThingAll(observationDS)[0]
      const existingMusMat = getUrl(thing, pref.oa + 'hasTarget')

      // console.log('Found existing ' + existingMusMat)

      // the current one is supposed to be added, so nothing needs to be done
      if (existingMusMat === id) {
        return null
      }

      if (existingMusMat !== null) {
        // remove old one
        dispatch('changeCurrentDataObject', {
          type: 'observation',
          id: currentObservationId,
          prop: pref.oa + 'hasTarget',
          method: 'removeUrl',
          val: existingMusMat
        })
        dispatch('removeCurrentDataObject', {
          type: 'musicalMaterial',
          object: state.currentAnnot.musicalMaterial[existingMusMat]
        })
      }
      // add new one
      dispatch('changeCurrentDataObject', {
        type: 'observation',
        id: currentObservationId,
        prop: pref.oa + 'hasTarget',
        method: 'setUrl',
        val: id
      })
      dispatch('addCurrentDataObject', {
        type: 'musicalMaterial',
        object: state.annotStore.musicalMaterial[id]
      })
    },
    setSelectionModeActive ({ commit }, bool) {
      commit('SET_SELECTION_MODE_ACTIVE', bool)
    },
    selectionToggle ({ commit, state }, id) {
      if (state.currentSelection === null) {
        const extractDS = state.currentAnnot.extract[state.currentExtract]
        const thing = getThingAll(extractDS)[0]

        const urls = getUrlAll(thing, pref.frbr + 'rdfs')

        if (urls.length > 0) {
          console.log('trying to activate selection. following thing should be an ID / uri: ', urls[0])
          commit('ACTIVATE_SELECTION', urls[0])
        } else {
          commit('ADD_NEW_SELECTION_TO_CURRENT_EXTRACT')
        }
      }

      commit('TOGGLE_SELECTION', id)

      // console.log('selectionToggle for ' + id)
    },
    saveCurrentAnnot ({ commit, state, dispatch }) {
      const uris = []

      const observations = Object.values(state.currentAnnot.observation)
      observations.forEach(observation => {
        uris.push(getPublicIdFromDataStructure(observation))
        dispatch('createDataObject', { type: 'observation', object: observation })
      })

      const musMats = Object.values(state.currentAnnot.musicalMaterial)
      musMats.forEach(musMat => {
        uris.push(getPublicIdFromDataStructure(musMat))
        dispatch('createDataObject', { type: 'musicalMaterial', object: musMat })
      })

      const extracts = Object.values(state.currentAnnot.extract)
      extracts.forEach(extract => {
        uris.push(getPublicIdFromDataStructure(extract))
        dispatch('createDataObject', { type: 'extract', object: extract })
      })

      const selections = Object.values(state.currentAnnot.selection)
      selections.forEach(selection => {
        uris.push(getPublicIdFromDataStructure(selection))
        dispatch('createDataObject', { type: 'selection', object: selection })
      })

      let listing = state.solidFileListing
      const listingPath = state.solidFileListingPath
      const authFetch = state.solidSession.fetch
      let thing = getThingAll(listing)[0]
      const existingUris = getUrlAll(thing, pref.ldp + 'contains')

      uris.forEach(uri => {
        if (existingUris.indexOf(uri) === -1) {
          thing = addUrl(thing, pref.ldp + 'contains', uri)
        }
      })

      listing = setThing(listing, thing)

      console.log('\nNeed to update listing. Should be like so now:', listing, uris)

      try {
        saveSolidDatasetAt(
          listingPath,
          listing,
          {
            fetch: authFetch
          }
        ).then(res => {
          console.log('updated index with ' + uris.length + ' entries')
          commit('SET_SOLID_FILE_LISTING', listing)
        }).catch(resErr => {
          console.log('ERRORED: ' + resErr)
        })
      } catch (err) {
        console.log('ERROR: Unable to update index at ' + listingPath + ' for strange errors: ' + err)
      }
      console.log('done updating')
      commit('SET_EDITING', null)

      /*

      let listing = state.solidFileListing
      const listingPath = state.solidFileListingPath
      let thing = getThingAll(listing)[0]
      let uris = getUrlAll(thing, pref.ldp + 'contains')

      if(uris.indexOf(uri) === -1) {
        thing = buildThing(thing)
          .addUrl(pref.ldp + 'contains', uri)
          .build()
      }
      listing = setThing(listing, thing)

      saveSolidDatasetAt(
        listingPath,
        listing,
        {
          fetch: authFetch
        }
      ).then(res => {
        console.log('updated index')
        commit('SET_SOLID_FILE_LISTING', listing)
      })

       */
    }

  },
  modules: {
  },
  getters: {
    views: state => {
      return state.views
    },
    graph: state => {
      return state.graph
    },
    meldStore: state => {
      return meldStore
    },
    arrangements: state => {
      // todo
      return state.arrangements // staticArrangements
    },
    worklist: state => {
      // todo
      return state.worklist // staticWorklist
    },
    work: (state) => (id) => {
      // todo
      // return staticWorklist.find(work => work['@id'] === id)
      return state.worklist.find(work => work['@id'] === id)
    },
    arrangementsForWork: (state) => (workId) => {
      return state.arrangements.filter(object => {
        let fits = false
        try {
          fits = object.work['@id'] === workId
        } catch (err) {
          console.log('ERROR retrieving arrangements for work ' + workId + ': ' + err)
        }
        return fits
      })
    },
    showLandingPage: state => {
      return state.perspective === 'landingPage'
    },
    showLibrary: state => {
      return state.perspective === 'library'
    },
    showWorkbench: state => {
      return state.perspective === 'workbench'
    },
    // rendering: state => async ({ uri, settings }) => {
    // vrvToolkit.setOptions(vrvPresets.fullScore)

    /* console.log('calling uri: ' + uri)
      console.log(settings)
      console.log('version: ' + vrvToolkit.getVersion())
      console.log(vrvPresets)

      console.log(vrvPresets[settings])

      const options = (typeof vrvPresets[settings] === 'object') ? vrvPresets[settings] : vrvPresets.fullScore
      let svg
      vrvToolkit.setOptions(options)
      await fetch(uri)
        .then(res => res.text())
        .then(mei => {
          vrvToolkit.loadData(mei)
          svg = vrvToolkit.renderToSVG(1, {})
        })

      return svg */

    /* console.log('me here! 1')
      let worker = new Worker('./../workers/verovio-worker.js');
      console.log('me here! 2')
      console.log(worker)
      worker.onmessage = function(event) {
        console.log(event.data);
      };
      console.log('me here! 3')
      const testWorker2 = () => {
        worker.postMessage( ["getVersion", 0, {}] );
      }
      console.log('me here! 4')
      testWorker2()
      console.log('me here! 5') */
    // },
    solidSession: state => {
      return state.solidSession
    },
    solidUser: state => {
      if (state.solidSession === null) {
        return 'not logged in'
      } else {
        return state.solidUser
      }
    },
    solidId: state => {
      return state.solidSession?.info?.webId
    },
    isLoggedIn: state => {
      return state.solidSession !== null
    },
    debugOverlayVisible: state => {
      return state.showDebugOverlay
    },
    observations: state => {
      return Object.values(state.annotStore.observation)
    },
    observationIDs: state => {
      return Object.keys(state.annotStore.observation)
    },
    observationLabel: (state) => (observationId) => {
      // console.log('searching ' + observationId)
      const observationDS = state.annotStore.observation[observationId]
      const thing = getThingAll(observationDS)[0]

      const target = getUrl(thing, pref.oa + 'hasTarget')

      const musMatDS = state.annotStore.musicalMaterial[target]
      const musMatThing = getThingAll(musMatDS)[0]

      const label = getStringNoLocale(musMatThing, pref.rdfs + 'label')

      return label
    },
    musicalMaterials: state => {
      return Object.values(state.annotStore.musicalMaterial)
    },
    musicalMaterialIDs: state => {
      return Object.keys(state.annotStore.musicalMaterial)
    },
    musicalMaterialLabel: (state) => (musMatId) => {
      console.log('searching ' + musMatId)
      const musMatDS = state.annotStore.musicalMaterial[musMatId]
      const thing = getThingAll(musMatDS)[0]
      const label = getStringNoLocale(thing, pref.rdfs + 'label')

      return label
    },
    extracts: state => {
      return Object.values(state.annotStore.extract)
    },
    selections: state => {
      return Object.values(state.annotStore.selection)
    },
    currentAnnot: state => {
      return state.currentAnnot
    },
    currentObservations: state => {
      return Object.values(state.currentAnnot.observation)
    },
    currentObservationId: state => {
      return Object.keys(state.currentAnnot.observation)[0]
    },
    currentObservationBody: state => {
      const observations = Object.values(state.currentAnnot.observation)
      if (observations.length === 0) {
        return null
      }

      const observationDS = observations[0]
      const thing = getThingAll(observationDS)[0]
      const body = getStringNoLocale(thing, pref.oa + 'bodyValue')

      return body
    },
    currentMusicalMaterials: state => {
      return Object.values(state.currentAnnot.musicalMaterial)
    },
    currentMusicalMaterialId: state => {
      return Object.keys(state.currentAnnot.musicalMaterial)[0]
    },
    currentMusicalMaterialLabel: state => {
      const musMats = Object.values(state.currentAnnot.musicalMaterial)
      if (musMats.length === 0) {
        return null
      }

      const musMatDS = musMats[0]
      const thing = getThingAll(musMatDS)[0]
      const label = getStringNoLocale(thing, pref.rdfs + 'label')

      return label
    },
    currentExtracts: state => {
      return Object.keys(state.currentAnnot.extract)
    },
    activeMusMat: state => {
      return state.currentMusMat
    },
    activeExtract: state => {
      return state.currentExtract
    },
    activeSelection: state => {
      return state.currentSelection
    },
    activeExtractObject: state => {
      return state.currentAnnot.extract[state.currentExtract]
    },
    workingExtract: (state) => (extractId) => {
      return state.currentAnnot.extract[extractId]
    },
    workingExtractLabel: (state) => (extractId) => {
      const extractDS = state.currentAnnot.extract[extractId]
      const thing = getThingAll(extractDS)[0]
      const label = getStringNoLocale(thing, pref.rdfs + 'label')

      return label
    },
    currentSelections: state => {
      return Object.values(state.currentAnnot.selection)
    },
    isEditing: state => {
      return state.editing !== null
    },
    editMode: state => {
      return state.editing
    },
    selectionModeActive: state => {
      return state.selectionModeActive
    },

    // getters for highlighting stuff
    allSelectionsForUri: (state) => (uri) => {
      const arr = []
      Object.values(state.annotStore.selection).forEach(selectionDS => {
        const thing = getThingAll(selectionDS)[0]
        const urls = getUrlAll(thing, pref.frbr + 'part')

        urls.forEach(idRef => {
          if (idRef.startsWith(uri)) {
            arr.push(idRef)
          }
        })
      })
      return arr
    },
    currentSelectionsForUri: (state) => (uri) => {
      const arr = []
      Object.values(state.currentAnnot.selection).forEach(selectionDS => {
        const thing = getThingAll(selectionDS)[0]
        const urls = getUrlAll(thing, pref.frbr + 'part')

        urls.forEach(idRef => {
          if (idRef.startsWith(uri)) {
            arr.push(idRef)
          }
        })
      })
      return arr
    },
    allSelectionsForCurrentMusMat: (state) => (uri) => {
      if (state.currentMusMat === null) {
        return []
      }
      const arr = []
      try {
        const musMatDS = state.currentAnnot.musicalMaterial[state.currentMusMat]
        const musMatThing = getThingAll(musMatDS)[0]

        const extractIDs = getUrlAll(musMatThing, pref.frbr + 'embodiment')
        extractIDs.forEach(extractId => {
          const extractDS = state.currentAnnot.extract[extractId]
          const extractThing = getThingAll(extractDS)[0]

          const selectionIDs = getUrlAll(extractThing, pref.frbr + 'embodiment')
          selectionIDs.forEach(selectionId => {
            const selectionDS = state.currentAnnot.selection[selectionId]
            const selectionThing = getThingAll(selectionDS)[0]

            const parts = getUrlAll(selectionThing, pref.frbr + 'part')
            parts.forEach(idRef => {
              if (idRef.startsWith(uri)) {
                arr.push(idRef)
              }
            })
          })
        })
      } catch (err) {}

      return arr
    },
    allSelectionsForCurrentExtract: (state) => (uri) => {
      if (state.currentExtract === null) {
        return []
      }
      const arr = []
      try {
        const extractDS = state.currentAnnot.extract[state.currentExtract]
        const extractThing = getThingAll(extractDS)[0]

        const selectionIDs = getUrlAll(extractThing, pref.frbr + 'embodiment')
        selectionIDs.forEach(selectionId => {
          const selectionDS = state.currentAnnot.selection[selectionId]
          const selectionThing = getThingAll(selectionDS)[0]

          const parts = getUrlAll(selectionThing, pref.frbr + 'part')
          parts.forEach(idRef => {
            if (idRef.startsWith(uri)) {
              arr.push(idRef)
            }
          })
        })
      } catch (err) {}

      return arr
    },
    allSelectionsForCurrentSelection: (state) => (uri) => {
      if (state.currentSelection === null) {
        return []
      }
      const arr = []
      try {
        const selectionDS = state.currentAnnot.selection[state.currentSelection]
        const selectionThing = getThingAll(selectionDS)[0]

        const parts = getUrlAll(selectionThing, pref.frbr + 'part')
        parts.forEach(idRef => {
          if (idRef.startsWith(uri)) {
            arr.push(idRef)
          }
        })
      } catch (err) {}

      return arr
    }
  }
})
