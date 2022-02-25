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

// Dependencies for MELD
import { registerTraversal, traverse, setTraversalObjectives, checkTraversalObjectives } from 'meld-clients-core/lib/actions/index'
import { prefix as pref } from './../meld/prefixes'//'meld-clients-core/lib/library/prefixes'
import { fetchGraph } from 'meld-clients-core/lib/actions/index'
import GraphReducer from 'meld-clients-core/lib/reducers/reducer_graph'
import TraversalPoolReducer from 'meld-clients-core/lib/reducers/reducer_traversalPool'

// Some Constants separated out from MELD (too lazy to import all of those individually)
import constants from '../meld/constants.js'

// Helper functions for MELD, which were part of the local StarBrightlyShining code
import { transformArrangement, addWork } from '../meld/functions.js'

// temporary shortcut to ensure a proper graph, while traversing is still being worked on
import { staticWorklist, staticArrangements } from './fakedata.js'

// setup for the graph to be traversed in this app
import { graphURI, params, traversalObjectives, MAX_TRAVERSERS } from './../../traversal.config.js'

// SolidPOD authentication library
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch
} from "@inrupt/solid-client-authn-browser";

// Import from "@inrupt/solid-client"
import {
  getSolidDataset,
  saveSolidDatasetAt,
  getThing,
  getStringNoLocale,
  getUrlAll
} from "@inrupt/solid-client";


/*******************************************/
/* BEGIN REDUX SETUP FOR MELD-CLIENTS-CORE */
const rootReducer = combineReducers({
  graph: GraphReducer,
  traversalPool: TraversalPoolReducer
});

// creating MELD Redux Store
const meldStore = createStore(rootReducer, applyMiddleware(thunk));
console.log("MELD: Initial State", meldStore.getState());
/* END REDUX SETUP FOR MELD-CLIENTS-CORE */

Vue.use(Vuex)

/* BEGIN SOLIDPOD SETUP */



/* END SOLIDPOD SETUP */



const graphComponentDidUpdate = (props, prevProps) => {
  // Boiler plate traversal code (should move to m-c-c)
  // Check whether the graph has updated and trigger further traversal as necessary.
  let prevPool = prevProps.traversalPool;
  let thisPool = props.traversalPool;
  let updated  = false;
  if (prevPool.running === 1 && thisPool.running === 0){
    // check our traversal objectives if the graph has updated
    console.error('checkTraversalObjectives()', props.graph.graph, props.graph.objectives)
    meldStore.dispatch(checkTraversalObjectives(props.graph.graph, props.graph.objectives));
    updated = true;
  } else if ( Object.keys(thisPool.pool).length && thisPool.running < MAX_TRAVERSERS) {
    // Initiate next traverser in pool...
    let arr = Object.keys(thisPool.pool)
    let uri = arr[arr.length - 1]
    console.warn('next traverse()', uri, thisPool.pool[uri])
    meldStore.dispatch(traverse(uri, thisPool.pool[uri]));
    // console.log('\n__traversing next')
    console.log('yodeyay – has was:' + prevProps.graph.outcomesHash + ', is now: ' + props.graph.outcomesHash)
    if (prevProps.graph.outcomesHash !== props.graph.outcomesHash) {
      updated = true;
    }
  } else if ( props.traversalPool.running===0 ) {
    if(prevProps.graph.outcomesHash !== props.graph.outcomesHash) {
      updated = true;
    }
  }
  return updated;
}

const graphHasChanged = (graph, commit) => {
  let arrangements = [];
  let worklist = [];

  console.log('graphHasChanged', graph)

  // 0. Get arrangements
  if(graph.graph && graph.graph.outcomes
     && graph.graph.outcomes[0]
     && graph.graph.outcomes[0]['@graph']
     && graph.graph.outcomes[0]['@graph'].length){

       // TODO: This isn't working
       console.log('\n-->in here, should work now!')
    arrangements = graph.graph.outcomes[0]['@graph'].map(transformArrangement);
    // Extract all unique works from the arrangements list
    worklist = arrangements.reduce(addWork, []);
  }
  // 1. convert this.graph.outcomes[0] into this.state.worklist

  commit('SET_ARRANGEMENTS', arrangements)
  commit('SET_WORKLIST', worklist)
}

export default new Vuex.Store({
  state: {
    graph: {},
    arrangements: [],
    worklist: [],
    views: [],
    perspective: 'landingPage',
    solidSession: null,
    solidUser: null
  },
  mutations: {
    ADD_VIEW (state, view) {
    //TODO: think about how to deal with more than 2 views
      state.views = state.views.concat([view])
    console.log("added new view:", view)
    },
    SET_GRAPH (state, graph) {
      state.graph = graph
    },
    SET_ARRANGEMENTS (state, arrangements) {
      state.arrangements = arrangements
    },
    SET_WORKLIST (state, worklist) {
      state.worklist = worklist
    },
    SET_PERSPECTIVE (state, perspective) {
      const perspectives = ['landingPage','library','workbench']
      if(perspectives.indexOf(perspective) !== -1) {
        state.perspective = perspective
      }
    },
    SET_SOLID_SESSION (state, session) {
      state.solidSession = session
    },
    SET_SOLID_USERNAME (state, username) {
      state.solidUser = username
    }
  },
  actions: {
    addView ({ commit }, view) {
      commit('ADD_VIEW', view)
    },
    setGraph ({ commit }, graph) {
      commit('SET_GRAPH', graph)
    },
    initMeld({ commit, state }) {
      console.log('initMeld()')
      // initialize Vuex store with initial Redux graph
      commit('SET_GRAPH', meldStore.getState())
      // listen to changes within MELD Redux
      const unsubscribe = meldStore.subscribe(() => {
        // get old graph from Vuex store
        const prevGraph = state.graph
        // get new graph from Redux store
        const graph = meldStore.getState()

        // copy new graph to Vuex store
        commit('SET_GRAPH', graph)

        // check if additional traversal jobs are necessary
        if(graphComponentDidUpdate(graph, prevGraph)) {
          // error level just to highlight between other console.messages
          console.error('passed')
          graphHasChanged(graph, commit)
        } else {
          console.log('not passed')
        }
      })
    },
    setTraversalObjectives({ commit }) {
      console.log('setTraversalObjectives()')
      meldStore.dispatch(setTraversalObjectives(traversalObjectives))
    },
    traverseGraph({ commit, state }) {
      // this initiates MELD traversal from within Vue. Called once…
      console.log('starting traverseGraph()')
      meldStore.dispatch(registerTraversal(graphURI, params))
      const newParams = meldStore.getState().traversalPool.pool[graphURI]
      if(newParams) meldStore.dispatch(traverse(graphURI, newParams))
			else meldStore.dispatch(traverse(graphURI, params));
    },
    setPerspective({ commit }, perspective) {
      commit('SET_PERSPECTIVE', perspective)
    },
    setSolidSession({ commit }, session) {
      commit('SET_SOLID_SESSION', session)

      try {
        const webId = session.info.webId
        const authFetch = session.fetch

        async function getUserName() {
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
      } catch(err) {
        console.log('ERROR retrieving username: ' + err)
      }

      // other approach:

      /*console.log('hello')
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
    uploadTest({ commit, state }) {
      const session = state.solidSession
      const webId = session.info.webId
      const authFetch = session.fetch

      if (session.info.isLoggedIn) {

        async function uploadData() {
          // get some random data…
          const userCard = await getSolidDataset(
            webId, {
            fetch: authFetch
          })

          // For example, the user must be someone with Write access to the specified URL.
          const savedSolidDataset = await saveSolidDatasetAt(
            "https://pod.inrupt.com/markannot/private/hello2.ttl",
            userCard, {
            fetch: authFetch
          });

          console.log('success', savedSolidDataset)
        }
        uploadData()

      }

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
        } catch(err) {
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
    isLoggedIn: state => {
      return state.solidSession !== null
    }
  }
})
