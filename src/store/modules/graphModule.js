import { graphComponentDidUpdate, graphHasChanged, initMeld } from '@/store/modules/meldStore.js'

// Dependencies for MELD
import { registerTraversal, traverse, setTraversalObjectives } from 'meld-clients-core/lib/actions/index'
// setup for the graph to be traversed in this app
import { graphURI, params, traversalObjectives } from '@/config/traversal.config.js'

export const graphModule = {
  meldStore: null,
  state: () => ({
    graph: {},
    arrangements: [],
    worklist: []
  }),
  mutations: {
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
    }
  },
  actions: {
    setGraph ({ commit }, graph) {
      commit('SET_GRAPH', graph)
    },
    initMeld ({ commit, state }) {
      console.log('initMeld()')

      this.meldStore = initMeld()

      // initialize Vuex store with initial Redux graph
      commit('SET_GRAPH', this.meldStore.getState())
      // listen to changes within MELD Redux
      this.meldStore.subscribe(() => {
        // get old graph from Vuex store
        const prevGraph = state.graph
        // get new graph from Redux store
        const graph = this.meldStore.getState()

        // copy new graph to Vuex store
        commit('SET_GRAPH', graph)

        // check if additional traversal jobs are necessary
        if (graphComponentDidUpdate(graph, prevGraph, this.meldStore)) {
          // error level just to highlight between other console.messages
          // console.error('passed')
          graphHasChanged(graph, commit)
        } else {
          // console.log('not passed')
        }
      })
    },
    setTraversalObjectives ({ commit }) {
      // console.log('setTraversalObjectives()')
      this.meldStore.dispatch(setTraversalObjectives(traversalObjectives))
    },
    traverseGraph ({ commit, state }) {
      // this initiates MELD traversal from within Vue. Called once…
      // console.log('starting traverseGraph()')
      const res = this.meldStore.dispatch(registerTraversal(graphURI, params))
      const newParams = res.payload.params // meldStore.getState().traversalPool.pool[graphURI]
      this.meldStore.dispatch(traverse(graphURI, newParams))// newParams))
    }
  },
  getters: {
    /* landingPageVisible: state => {
      return state.landingPageVisible
    } */
  }
}
