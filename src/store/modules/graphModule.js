import { graphComponentDidUpdate, graphHasChanged, initMeld } from '@/store/modules/meld.js'

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
          graphHasChanged(graph, commit)
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
    graph: state => {
      return state.graph
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
    meiByManifestUri: (state) => (manifestUri) => {
      const arr = state.arrangements.find(arr => {
        return arr.iiif === manifestUri
      })

      if (arr.MEI === false) {
        return null
      } else {
        return arr.MEI
      }
    }
  }
}
