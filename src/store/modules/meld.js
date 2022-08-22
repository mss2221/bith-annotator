// External Dependencies for MELD Redux Store
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'

// Dependencies for MELD
import { traverse, checkTraversalObjectives } from 'meld-clients-core/lib/actions/index'
import { prefix } from '@/meld/prefixes.js'
import GraphReducer from 'meld-clients-core/lib/reducers/reducer_graph'
import TraversalPoolReducer from 'meld-clients-core/lib/reducers/reducer_traversalPool'

// setup for the graph to be traversed in this app
import { MAX_TRAVERSERS } from '@/config/traversal.config.js'

/**
 * transformArrangement converts the output of the graph traversal and conerts it to a local object more easily understood.
 * Originally written by MELD
 * @param  {[type]} graph               [description]
 * @return {[type]}       [description]
 */
export const transformArrangement = (graphObject) => {
  // Take graph of arrangement and make more intuitive local object
  const obj = {}
  obj.shortTitle = graphObject[prefix.bibo + 'shortTitle']
  obj.genre = prefix.dbpedia + 'genre' in graphObject ? graphObject[prefix.dbpedia + 'genre']['@id'] : false
  obj.arranger = graphObject[prefix.gndo + 'arranger'] // Change so we have name, not URL
  obj.publisher = graphObject[prefix.dce + 'publisher'] // Change so we have name, not URL
  obj.date = graphObject[prefix.gndo + 'dateOfPublication']
  obj.MEI = prefix.frbr + 'embodiment' in graphObject ? graphObject[prefix.frbr + 'embodiment']['@id'] : false
  obj.place = graphObject[prefix.rdau + 'P60163']
  // obj.catNumber = pref.wdt+"P217" in graph ? graph[pref.wdt+"P217"]['@id'] : false;
  obj.catNumber = graphObject[prefix.wdt + 'P217']
  obj.work = graphObject[prefix.rdau + 'P60242']
  // console.log("Processed a ", graph, " into a ", obj);
  return obj
}

export const addWork = (worklist, arrangement) => {
  if (!arrangement.work || !('@id' in arrangement.work)) {
    return worklist
  }
  const wID = arrangement.work['@id']
  if (worklist.find(x => x['@id'] === wID)) {
    return worklist
  } else {
    const wl2 = worklist.slice()
    wl2.push(arrangement.work)
    return wl2
  }
}

export const graphComponentDidUpdate = (props, prevProps, meldStore) => {
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

export const graphHasChanged = (graph, commit) => {
  let arrangements = []
  let worklist = []

  // 0. Get arrangements
  if (graph.graph && graph.graph.outcomes &&
     graph.graph.outcomes[0] &&
     graph.graph.outcomes[0]['@graph'] &&
     graph.graph.outcomes[0]['@graph'].length) {
    arrangements = graph.graph.outcomes[0]['@graph'].map(transformArrangement)
    // Extract all unique works from the arrangements list
    // worklist = arrangements.reduce(addWork, [])

    const workMap = new Map()
    arrangements.forEach(arr => {
      if (arr.work && arr.work['@id']) {
        workMap.set(arr.work['@id'], arr.work)
      }
    })
    worklist = [...workMap.values()]
  }
  // 1. convert this.graph.outcomes[0] into this.state.worklist
  commit('SET_ARRANGEMENTS', arrangements)
  commit('SET_WORKLIST', worklist)
}

export const initMeld = () => {
  /*******************************************/
  /* BEGIN REDUX SETUP FOR MELD-CLIENTS-CORE */
  const rootReducer = combineReducers({
    graph: GraphReducer,
    traversalPool: TraversalPoolReducer
  })

  // creating MELD Redux Store
  const meldStore = createStore(rootReducer, applyMiddleware(thunk))
  // console.log('MELD: Initial State', meldStore.getState())
  /* END REDUX SETUP FOR MELD-CLIENTS-CORE */

  return meldStore
}
