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
  saveSolidDatasetAt,
  getThing,
  getStringNoLocale //,
  // getUrlAll
} from '@inrupt/solid-client'

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

  console.log('graphHasChanged', graph)

  // 0. Get arrangements
  if (graph.graph && graph.graph.outcomes &&
     graph.graph.outcomes[0] &&
     graph.graph.outcomes[0]['@graph'] &&
     graph.graph.outcomes[0]['@graph'].length) {
    // TODO: This isn't working
    console.log('\n-->in here, should work now!')
    arrangements = graph.graph.outcomes[0]['@graph'].map(transformArrangement)
    // Extract all unique works from the arrangements list
    worklist = arrangements.reduce(addWork, [])
  }
  // 1. convert this.graph.outcomes[0] into this.state.worklist

  commit('SET_ARRANGEMENTS', arrangements)
  commit('SET_WORKLIST', worklist)
}

// creates an annotation stub
const getAnnotStub = (state) => {

  const user = state.solidSession.info.webId
  const d = new Date()
  const date = d.toISOString()
  // https://pod.inrupt.com/kepper/profile/card#me
  // https://pod.inrupt.com/kepper/public/
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/annotations/' + plainId + '.jsonld'

  const anno = {
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
  }
  return anno
}

// creates a musicalMaterial stub
const getMusMatStub = (state) => {
  const user = state.solidSession.info.webId
  const d = new Date()
  const date = d.toISOString()
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/musicalMaterials/' + plainId + '.jsonld'

  const musMat = {
    "@type": "https://example.com/Terms/MusicalMaterial",
    "@id": id,
    "http://purl.org/dc/terms/created": date,
    "http://purl.org/dc/terms/creator": user,
    "https://www.w3.org/2000/01/rdf-schema#label": "",
    "http://purl.org/vocab/frbr/core#embodiment": []
  }
  return musMat
}

const getExtractStub = (state) => {
  const user = state.solidSession.info.webId
  const d = new Date()
  const date = d.toISOString()
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/extracts/' + plainId + '.jsonld'

  const extract = {
    "@type": "https://example.com/Terms/Extract",
    "@id": id,
    "http://purl.org/dc/terms/created": date,
    "http://purl.org/dc/terms/creator": user,
    "https://www.w3.org/2000/01/rdf-schema#label": "",
    "http://purl.org/vocab/frbr/core#member": []
  }

  return extract
}

const getSelectionStub = (state) => {
  const user = state.solidSession.info.webId
  const d = new Date()
  const date = d.toISOString()
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/selections/' + plainId + '.jsonld'

  const selection = {
    "@type": "https://example.com/Terms/Selection",
    "@id": id,
    "http://purl.org/dc/terms/created": date,
    "http://purl.org/dc/terms/creator": user,
    "https://www.w3.org/2000/01/rdf-schema#label": "–",
    "http://purl.org/vocab/frbr/core#part": []
  }

  return selection
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
      Vue.set(state, 'index')
      state.views = state.views.splice(index, 0)
    },
    REMOVE_ALL (state) {

    },
    SET_GRAPH (state, graph) {
      state.graph = graph
    },
    SET_ARRANGEMENTS (state, arrangements) {
      state.arrangements = arrangements

      console.log('hallo test')
      const meiLinks = []
      arrangements.forEach(arr => {
        meiLinks.push(arr.MEI)
      })
      console.log(meiLinks)
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
    ADD_TO_ANNOTSTORE (state, payload) {
      const type = payload.type
      const obj = payload.object

      if(type in state.annotStore) {
        Vue.set(state.annotStore[type], obj['@id'], obj)
      }
    },
    REMOVE_FROM_ANNOTSTORE (state, payload) {
      const type = payload.type
      const obj = payload.object

      if(type in state.annotStore) {
        Vue.delete(state.annotStore[type], obj['@id'])
      }
    },
    ADD_TO_CURRENT_ANNOT (state, payload) {
      const type = payload.type
      const obj = payload.object

      if(type in state.currentAnnot) {
        Vue.set(state.currentAnnot[type], obj['@id'], obj)
      }
    },
    REMOVE_FROM_CURRENT_ANNOT (state, payload) {
      const type = payload.type
      const obj = payload.object

      if(type in state.currentAnnot) {
        Vue.delete(state.currentAnnot[type], obj['@id'])
      }
    },
    TOGGLE_DEBUG_OVERLAY (state) {
      state.showDebugOverlay = !state.showDebugOverlay
    },
    SET_EDITING (state, mode) {

      // already there
      if(state.editing === mode) {
        return true
      }

      if(mode === null) {

        Vue.set(state, 'currentAnnot', {
          observation: {},
          musicalMaterial: {},
          extract: {},
          selection: {}
        })
        state.editing = mode
        state.selectionModeActive = false
        state.currentMusMat = null
        state.currentExtract = null
        state.currentSelection = null

      } else if(mode === 'parallelPassage') {

        // starting new parallel passage
        if(state.currentMusMat === null) {

          const stub = getMusMatStub(state)
          let musMat = {}
          musMat[stub['@id']] = stub

          Vue.set(state, 'currentAnnot', {
            observation: {},
            musicalMaterial: musMat,
            extract: {},
            selection: {}
          })
          state.editing = mode
          state.selectionModeActive = false
          state.currentMusMat = stub['@id']
          state.currentExtract = null
          state.currentSelection = null
        } else {
          // opening existing parallel passage

          console.log('x2')

          const musMat = state.annotStore.musicalMaterial[state.currentMusMat]
          let mm = {}
          let ex = {}
          let sel = {}

          console.log('x3')

          const extracts = musMat['http://purl.org/vocab/frbr/core#embodiment']
          mm[musMat['@id']] = musMat
          extracts.forEach(extractId => {
            const extract = state.annotStore.extract[extractId]

            ex[extractId] = extract
            console.log('extract, looking for member')
            console.log(extract)
            const selections = extract['http://purl.org/vocab/frbr/core#member']
            selections.forEach(selectionId => {
              const selection = state.annotStore.selection[selectionId]
              sel[selectionId] = selection
            })
          })

          console.log('x4')

          Vue.set(state, 'currentAnnot', {
            observation: {},
            musicalMaterial: mm,
            extract: ex,
            selection: sel
          })

          state.editing = mode
          state.selectionModeActive = false
          state.currentExtract = null
          state.currentSelection = null

        }

      } else if(mode === 'observation') {
        console.log('todo: how to enter observation editing mode?')
      }

      /*if([null,'parallelPassage','observation'].indexOf(mode) !== -1) {
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
      }*/
    },
    SET_SELECTION_MODE_ACTIVE (state, bool) {
      state.selectionModeActive = bool
      if(!bool) {
        state.currentSelection = null
      }
    },
    ADD_PASSAGE (state) {

      const extractStub = getExtractStub(state)

      state.currentExtract = extractStub['@id']

      Vue.set(state.currentAnnot.extract, extractStub['@id'], extractStub)

      const musMat = Object.values(state.currentAnnot.musicalMaterial)[0]
      const musMatId = musMat['@id']

      state.currentAnnot.musicalMaterial[musMatId]['http://purl.org/vocab/frbr/core#embodiment'].push(extractStub['@id'])
      state.currentSelection = null

    },
    SET_ACTIVE_MUSMAT (state, id) {
      state.currentMusMat = id
    },
    ACTIVATE_PASSAGE (state, id) {
      state.currentExtract = id
      state.currentSelection = null
    },
    ACTIVATE_SELECTION (state, id) {
      state.currentSelection = id
    },
    ADD_NEW_SELECTION_TO_CURRENT_EXTRACT (state) {
      const selectionStub = getSelectionStub(state)

      state.currentSelection = selectionStub['@id']

      Vue.set(state.currentAnnot.selection, selectionStub['@id'], selectionStub)

      state.currentAnnot.extract[state.currentExtract]['http://purl.org/vocab/frbr/core#member'].push(selectionStub['@id'])
    },
    TOGGLE_SELECTION (state, id) {
      const arr = state.currentAnnot.selection[state.currentSelection]['http://purl.org/vocab/frbr/core#part']

      const index = arr.indexOf(id)

      if(index === -1) {
        arr.push(id)
      } else {
        arr.splice(index,1)
      }
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
      console.log(0)
      console.log(graphURI)
      console.log(params)
      meldStore.dispatch(registerTraversal(graphURI, params))
      console.log(1)
      const newParams = meldStore.getState().traversalPool.pool[graphURI]
      console.log(2)
      meldStore.dispatch(traverse(graphURI, newParams))
      console.log(3)
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
    uploadTest ({ commit, state }) {
      const session = state.solidSession
      const webId = session.info.webId
      const authFetch = session.fetch

      if (session.info.isLoggedIn) {
        async function uploadData () {
          // get some random data…
          const userCard = await getSolidDataset(
            webId, {
              fetch: authFetch
            })

          // For example, the user must be someone with Write access to the specified URL.
          const savedSolidDataset = await saveSolidDatasetAt(
            'https://pod.inrupt.com/markannot/private/hello2.ttl',
            userCard, {
              fetch: authFetch
            })

          console.log('success', savedSolidDataset)
        }
        uploadData()
      }
    },
    toggleDebugOverlay ({ commit, state }) {
      commit('TOGGLE_DEBUG_OVERLAY')
    },
    createDataObject ({ commit, state }, payload) {
      if(payload.type in state.annotStore && payload.object) {

        //upload to SolidPod, if successful store in Vuex
        commit('ADD_TO_ANNOTSTORE', payload)
      }
    },
    changeDataObject ({ commit, state }, payload) {
      if(payload.type in state.annotStore && payload.object) {

        //upload to SolidPod, if successful store in Vuex
        commit('ADD_TO_ANNOTSTORE', payload)
      }
    },
    removeDataObject ({ commit, state }, payload) {
      if(payload.type in state.annotStore && payload.object) {

        //delete from SolidPod, if successful store in Vuex
        commit('REMOVE_FROM_ANNOTSTORE', payload)
      }
    },
    addCurrentDataObject ({ commit, state }, payload) {
      if(payload.type in state.currentAnnot && payload.object) {
        commit('ADD_TO_CURRENT_ANNOT', payload)
      }
    },
    changeCurrentDataObject ({ commit, state }, payload) {
      if(payload.type in state.currentAnnot && payload.object) {
        commit('ADD_TO_CURRENT_ANNOT', payload)
      }
    },
    removeCurrentDataObject ({ commit, state }, payload) {
      if(payload.type in state.currentAnnot && payload.object) {
        commit('REMOVE_FROM_CURRENT_ANNOT', payload)
      }
    },
    setEditing ({ commit }, mode) {
      commit('SET_EDITING', mode)
    },
    addPassage ({ commit }) {
      commit('ADD_PASSAGE')
    },
    setActiveMusMat({ commit }, id) {
      commit('SET_ACTIVE_MUSMAT', id)
    },
    setActivePassage ({ commit, state, dispatch }, id) {
      commit('ACTIVATE_PASSAGE', id)
      commit('SET_SELECTION_MODE_ACTIVE', true)
    },
    setSelectionModeActive ({ commit }, bool) {
      commit('SET_SELECTION_MODE_ACTIVE', bool)
    },
    selectionToggle ({ commit, state }, id) {

      if(state.currentSelection === null) {
        const ex = state.currentAnnot.extract[state.currentExtract]
        if(ex['http://purl.org/vocab/frbr/core#member'].length > 0) {
          commit('ACTIVATE_SELECTION', ex['http://purl.org/vocab/frbr/core#member'][0])
        } else {
          commit('ADD_NEW_SELECTION_TO_CURRENT_EXTRACT')
        }
      }

      commit('TOGGLE_SELECTION', id)

      // console.log('selectionToggle for ' + id)
    },
    saveCurrentAnnot ({ commit, state, dispatch }) {

      const musMats = Object.values(state.currentAnnot.musicalMaterial)
      musMats.forEach(musMat => {
        dispatch('createDataObject',{ type: 'musicalMaterial', object: musMat})
      })

      const extracts = Object.values(state.currentAnnot.extract)
      extracts.forEach(extract => {
        dispatch('createDataObject',{ type: 'extract', object: extract})
      })

      const selections = Object.values(state.currentAnnot.selection)
      selections.forEach(selection => {
        dispatch('createDataObject',{ type: 'selection', object: selection})
      })

      commit('SET_EDITING', null)
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
      return staticArrangements // state.arrangements
    },
    worklist: state => {
      // todo
      return staticWorklist // state.worklist
    },
    work: (state) => (id) => {
      // todo
      return staticWorklist.find(work => work['@id'] === id)
    },
    arrangementsForWork: (state) => (workId) => {
      return staticArrangements.filter(object => {
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
      return state.solidSession.info.webId
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
    musicalMaterials: state => {
      return Object.values(state.annotStore.musicalMaterial)
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
    currentMusicalMaterials: state => {
      return Object.values(state.currentAnnot.musicalMaterial)
    },
    currentExtracts: state => {
      return Object.values(state.currentAnnot.extract)
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
      let arr = []
      Object.values(state.annotStore.selection).forEach(sel => {
        sel['http://purl.org/vocab/frbr/core#part'].forEach(idRef => {
          if(idRef.startsWith(uri)) {
            arr.push(idRef)
          }
        })
      })
      return arr
    },
    currentSelectionsForUri: (state) => (uri) => {
      let arr = []
      Object.values(state.currentAnnot.selection).forEach(sel => {
        sel['http://purl.org/vocab/frbr/core#part'].forEach(idRef => {
          if(idRef.startsWith(uri)) {
            arr.push(idRef)
          }
        })
      })
      return arr
    },
    allSelectionsForCurrentMusMat: (state) => (uri) => {
      if(state.currentMusMat === null) {
        return []
      }
      let arr = []
      try {
        const musMat = state.currentAnnot.musicalMaterial[state.currentMusMat]
        musMat['http://purl.org/vocab/frbr/core#embodiment'].forEach(extractId => {
          state.currentAnnot.extract[extractId]['http://purl.org/vocab/frbr/core#member'].forEach(selectionId => {
            state.currentAnnot.selection[selectionId]['http://purl.org/vocab/frbr/core#part'].forEach(idRef => {
              if(idRef.startsWith(uri)) {
                arr.push(idRef)
              }
            })
          })
        })
      } catch(err) {}

      return arr
    },
    allSelectionsForCurrentExtract: (state) => (uri) => {
      if(state.currentExtract === null) {
        return []
      }
      let arr = []
      try {
        const extract = state.currentAnnot.extract[state.currentExtract]
        extract['http://purl.org/vocab/frbr/core#member'].forEach(selectionId => {
          state.currentAnnot.selection[selectionId]['http://purl.org/vocab/frbr/core#part'].forEach(idRef => {
            if(idRef.startsWith(uri)) {
              arr.push(idRef)
            }
          })
        })
      } catch(err) {}

      return arr
    },
    allSelectionsForCurrentSelection: (state) => (uri) => {
      if(state.currentSelection === null) {
        return []
      }
      let arr = []
      try {
        const sel = state.currentAnnot.selection[state.currentSelection]
        sel['http://purl.org/vocab/frbr/core#part'].forEach(idRef => {
          if(idRef.startsWith(uri)) {
            arr.push(idRef)
          }
        })
      } catch(err) {}

      return arr
    }
  }
})
