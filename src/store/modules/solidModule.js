import { prefix as pref } from '@/meld/prefixes' // 'meld-clients-core/lib/library/prefixes'
import { bithTypes } from '@/meld/constants.js'

import {
  // addUrl,
  buildThing,
  getDate,
  getStringNoLocale,
  // getThingAll,
  getUrl,
  getUrlAll,
  saveSolidDatasetAt,
  setThing,
  // getSolidDataset,
  // solidDatasetAsTurtle,
  asUrl,
  createSolidDataset
  // isThing
  // isThingLocal
  // createThing
} from '@inrupt/solid-client'

import {
  // getPublicIdFromDataStructure,
  getAnnotThing,
  getMusMatThing,
  getExtractThing,
  getSelectionThing,
  resetActivations,
  populateActivations,
  emptyCurrentThings,
  makeThingsCurrent,
  getChildren,
  getParents,
  getPredicateByType,
  getTypeById,
  simplifiedTypeByType
} from '@/store/tools/solidHelpers.js'

import { loadPod } from '@/store/modules/userModule.js'

// eslint-disable-next-line
const parser = new DOMParser()

export const solidModule = {
  state: () => ({
    thingStore: {},
    currentThings: {},
    activated: {
      observation: null,
      musicalMaterial: null,
      extract: null,
      selection: null
    }
  }),
  mutations: {
    /**
     * this empties the thingStore and resets currentThings before loading new data
     * @param {[type]} state  [description]
     */
    EMPTY_THINGSTORE (state) {
      state.thingStore = {}
      state.currentThings = {}
    },

    /**
     * empties the currentThings
     * @param {[type]} state  [description]
     */
    EMPTY_CURRENT_THINGS (state) {
      emptyCurrentThings(state)
    },

    /**
     * store thing in thingStore by ID
     * @param {[type]} state  [description]
     * @param {[type]} thing  the Solid thing
     */
    ADD_TO_THINGSTORE (state, { thing, userPodPath }) {
      const uri = asUrl(thing, userPodPath)
      state.thingStore[uri] = thing
    },
    /**
     * keep thing in currentThings by ID
     * @param {[type]} state  [description]
     * @param {[type]} thing  the Solid thing
     */
    MOVE_TO_CURRENT_THINGS (state, { thing, userPodPath }) {
      const uri = asUrl(thing, userPodPath)
      state.currentThings[uri] = thing
    },
    /**
     * remove thing from thingStore – this is currently not used
     * @param {[type]} state    [description]
     * @param {[type]} thing  the Solid thing
     */
    /* REMOVE_FROM_THINGSTORE (state, { thing, userPodPath }) {
      const uri = asUrl(thing, userPodPath)
      state.thingStore[uri] = undefined
    }, */

    /**
     * remove thing from currentThings after editing – this is currently not used
     * @param {[type]} state  [description]
     * @param {[type]} thing  [description]
     */
    /* REMOVE_FROM_CURRENT_THINGS (state, { thing, userPodPath }) {
      const uri = asUrl(thing, userPodPath)
      state.currentThings[uri] = undefined
    }, */

    /**
     * used for changes to current thing
     * @param {[type]} state    [description]
     * @param {[type]} payload  [description]
     */
    CHANGE_CURRENT_THING (state, payload) {
      // const type = payload.type
      const uri = payload.uri
      const prop = payload.prop
      const method = payload.method
      const val = payload.val

      let thing = state.currentThings[uri]

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

      state.currentThings[uri] = thing
    },

    // TODO: Is this used at all?
    /* SET_EDITING (state, mode, solidUserPodPath) {
      console.log('\n\nIS THIS USED AT ALL???')
      // already there
      if (state.editing === mode) {
        return true
      }

      if (mode === null) {
        emptyCurrentThings(state)
        resetActivations(state)
      } else if (mode === 'parallelPassage') {
        // starting new parallel passage
        if (state.activated.musicalMaterial === null) {
          const ds = getMusMatThing(state)
          const id = getPublicIdFromDataStructure(ds)

          const musMat = {}
          musMat[id] = ds

          makeThingsCurrent(state, {}, musMat, {}, {})
          populateActivations(state, null, id, null, null)
        } else {
          // opening existing parallel passage
          const mm = {}
          const ex = {}
          const sel = {}

          const id = state.activated.musicalMaterial
          const ds = state.thingStore.musicalMaterial[id]

          mm[id] = ds

          const thing = getThingAll(ds)[0]
          const extracts = getUrlAll(thing, pref.frbr + 'embodiment')

          extracts.forEach(extractId => {
            const extract = state.thingStore.extract[extractId]

            ex[extractId] = extract

            const exThing = getThingAll(extract)[0]
            const selections = getUrlAll(exThing, pref.frbr + 'embodiment')

            selections.forEach(selectionId => {
              const selection = state.thingStore.selection[selectionId]
              sel[selectionId] = selection
            })
          })

          makeThingsCurrent(state, {}, mm, ex, sel)
          populateActivations(state, null, id, null, null)
        }
      } else if (mode === 'observation') {
        // starting new observation
        if (state.currentObservation === null) {
          const ds = getAnnotThing(state)
          const id = getPublicIdFromDataStructure(ds)

          const observation = {}
          observation[id] = ds

          makeThingsCurrent(state, observation, {}, {}, {})
          populateActivations(state, id, null, null, null)
        } else {
          // opening existing observation
          const ob = {}
          const mm = {}
          const ex = {}
          const sel = {}

          const id = state.activated.observation
          const ds = state.thingStore.observation[id]

          ob[id] = ds

          const thing = getThingAll(ds)[0]

          const musMatId = getUrl(thing, pref.oa + 'hasTarget')
          const musMat = state.thingStore.musicalMaterial[musMatId]

          mm[musMatId] = musMat
          const mmThing = getThingAll(musMat)[0]
          const extracts = getUrlAll(mmThing, pref.frbr + 'embodiment')

          extracts.forEach(extractId => {
            const extract = state.thingStore.extract[extractId]

            ex[extractId] = extract

            const exThing = getThingAll(extract)[0]
            const selections = getUrlAll(exThing, pref.frbr + 'embodiment')

            selections.forEach(selectionId => {
              const selection = state.thingStore.selection[selectionId]
              sel[selectionId] = selection
            })
          })

          makeThingsCurrent(state, ob, mm, ex, sel)
          populateActivations(state, id, null, null, null)
        }
      }
    }, */

    /**
     * start editing with one specific object and all its children
     * @param {[type]} state        [description]
     * @param {[type]} uri          [description]
     * @param {[type]} userPodPath  [description]
     */
    START_EDITING (state, { uri, userPodPath }) {
      // console.log('\nSTART_EDITING ' + uri + ' – ' + userPodPath)
      emptyCurrentThings(state)
      // console.log(1)
      const thing = state.thingStore[uri]
      // console.log(2, thing)
      makeThingsCurrent(state, [thing], userPodPath)
      // console.log(3)

      // get type of current thing and determine position in hierarchy
      const type = (getUrl(thing, pref.rdf + 'type') !== null) ? getUrl(thing, pref.rdf + 'type') : getStringNoLocale(thing, pref.rdf + 'type')
      const types = [bithTypes.observation, bithTypes.musicalMaterial, bithTypes.extract, bithTypes.selection]
      const currentIndex = types.indexOf(type)

      // set activations value according to index
      const activations = [null, null, null, null]
      activations[currentIndex] = uri
      populateActivations(state, activations[0], activations[1], activations[2], activations[3])

      // recursive function to also put children to currentThings
      const resolveChildren = (thing, parentIndex) => {
        const uri = asUrl(thing, userPodPath)
        makeThingsCurrent(state, [thing], userPodPath)

        const nextIndex = parentIndex + 1

        if (nextIndex < types.length) {
          // const nextType = types[nextIndex]

          const children = getChildren(state, uri)

          children.forEach(childThing => {
            resolveChildren(childThing, currentIndex)
          })
        }
      }

      // identify children and run function on them
      const children = getChildren(state, uri)
      children.forEach(childThing => {
        resolveChildren(childThing, currentIndex)
      })
    },

    /**
     * creates a new extract and adds it to the list of current things
     * @param {[type]} state        [description]
     * @param {[type]} user         [description]
     * @param {[type]} userPodPath  [description]
     */
    ADD_EXTRACT (state, { user, userPodPath }) {
      const extract = getExtractThing(user, userPodPath)
      const uri = asUrl(extract, userPodPath)
      emptyCurrentThings(state)
      resetActivations(state)

      makeThingsCurrent(state, [extract], userPodPath)

      state.activated.extract = uri
      state.activated.selection = null
    },

    /**
     * creates a new musicalMaterial and adds it to the list of current things
     * @param {[type]} state        [description]
     * @param {[type]} user         [description]
     * @param {[type]} userPodPath  [description]
     */
    ADD_MUSMAT (state, { user, userPodPath }) {
      const musMat = getMusMatThing(user, userPodPath)
      const uri = asUrl(musMat, userPodPath)

      emptyCurrentThings(state)
      resetActivations(state)

      makeThingsCurrent(state, [musMat], userPodPath)

      state.activated.musicalMaterial = uri
    },

    /**
     * creates a new observation / annotation and adds it to the list of current things
     * @param {[type]} state        [description]
     * @param {[type]} user         [description]
     * @param {[type]} userPodPath  [description]
     */
    ADD_OBSERVATION (state, { user, userPodPath }) {
      const observation = getAnnotThing(user, userPodPath)
      const uri = asUrl(observation, userPodPath)
      console.log('\nHERE')
      console.log(observation)

      emptyCurrentThings(state)
      resetActivations(state)

      makeThingsCurrent(state, [observation], userPodPath)

      state.activated.observation = uri
    },

    /**
     * activate the given thing
     * @param {[type]} state  [description]
     * @param {[type]} uri  [description]
     */
    ACTIVATE_THING (state, uri) {
      // console.log('ACTIVATE_THING with uri ' + typeof uri + ': ' + uri)
      // console.log(uri)
      const thing = state.currentThings[uri] !== undefined ? state.currentThings[uri] : state.thingStore[uri]
      // console.log(thing)
      // console.log(state.currentThings)
      // console.log(state.thingStore)
      const type = (getUrl(thing, pref.rdf + 'type') !== null) ? getUrl(thing, pref.rdf + 'type') : getStringNoLocale(thing, pref.rdf + 'type')

      if (type in bithTypes) {
        if (type === bithTypes.observation) {
          state.activated.observation = uri
        } else if (type === bithTypes.musicalMaterial) {
          state.activated.musicalMaterial = uri
        } else if (type === bithTypes.extract) {
          state.activated.extract = uri
          state.activated.selection = null
        } else if (type === bithTypes.selection) {
          state.activated.selection = uri
        }
      }
    },

    /**
     * deactivates the given type
     * @param {[type]} state  [description]
     * @param {[type]} type   [description]
     */
    DEACTIVATE_THING (state, type) {
      state.activated[type] = null
    },

    /**
     * adds a new selection thing to the current extract thing
     * @param {[type]} state        [description]
     * @param {[type]} user         [description]
     * @param {[type]} userPodPath  [description]
     */
    ADD_NEW_SELECTION_TO_CURRENT_EXTRACT (state, { user, userPodPath }) {
      const selection = getSelectionThing(user, userPodPath)
      const selectionUri = asUrl(selection, userPodPath)

      makeThingsCurrent(state, [selection], userPodPath)
      state.activated.selection = selectionUri

      const extractUri = state.activated.extract
      let extract = state.currentThings[extractUri]

      extract = buildThing(extract)
        .addUrl(pref.frbr + 'embodiment', selectionUri)
        .build()

      state.currentThings[extractUri] = extract
    },

    /**
     * toggle a selection by a given URI in the selection thing
     * @param {[type]} state  [description]
     * @param {[type]} uri    [description]
     */
    TOGGLE_SELECTION (state, uri) {
      const selectionThingUri = state.activated.selection
      let selectionThing = state.currentThings[selectionThingUri]

      const urls = getUrlAll(selectionThing, pref.frbr + 'part')

      if (urls.indexOf(uri) === -1) {
        selectionThing = buildThing(selectionThing)
          .addUrl(pref.frbr + 'part', uri)
          .build()
      } else {
        selectionThing = buildThing(selectionThing)
          .removeUrl(pref.frbr + 'part', uri)
          .build()
      }

      state.currentThings[selectionThingUri] = selectionThing
    }

    /**
     * toggles a facsimile URI at the activated selection
     * @param {[type]} state  [description]
     * @param {[type]} uri    [description]
     */
    /* TOGGLE_FACSIMILE_URI_AT_ACTIVATED_SELECTION (state, uri) {
      if (state.activated.extract !== null &&
        state.activated.selection) {
        //
        let selectionDS = state.currentThings.selection[state.activated.selection]
        const selectionId = getPublicIdFromDataStructure(selectionDS)
        let thing = getThingAll(selectionDS)[0]

        console.log('HELLO HIER')
        console.log(selectionDS)
        console.log(selectionId)
        console.log(thing)

        const urls = getUrlAll(thing, pref.frbr + 'part')
        console.log(urls)
        if (urls.indexOf(uri) === -1) {
          console.log('----> adding url ' + uri)
          thing = buildThing(thing)
            .addUrl(pref.frbr + 'part', uri) // should it be possible to have multiple rects?
            .build()
        } else {
          thing = buildThing(thing)
            .removeUrl(pref.frbr + 'part', uri)
            .build()
        }

        selectionDS = setThing(selectionDS, thing)
        state.currentThings.selection[selectionId] = selectionDS
      }
    } */
  },
  actions: {
    /**
     * adds a new extract thing
     * @param {[type]} commit     [description]
     * @param {[type]} rootState  [description]
     */
    addExtract ({ commit, rootState }) {
      const userState = rootState.user
      const user = userState.solidSession.info.webId
      const userPodPath = userState.solidUserPodPath

      commit('ADD_EXTRACT', { user, userPodPath })
      commit('ADD_NEW_SELECTION_TO_CURRENT_EXTRACT', { user, userPodPath })
    },

    /**
     * adds a new musical material thing
     * @param {[type]} commit     [description]
     * @param {[type]} rootState  [description]
     */
    addMusMat ({ commit, rootState }) {
      const userState = rootState.user
      const user = userState.solidSession.info.webId
      const userPodPath = userState.solidUserPodPath

      commit('ADD_MUSMAT', { user, userPodPath })
    },

    /**
     * adds a new observation / annotation thing
     * @param {[type]} commit     [description]
     * @param {[type]} rootState  [description]
     */
    addObservation ({ commit, rootState }) {
      const userState = rootState.user
      const user = userState.solidSession.info.webId
      const userPodPath = userState.solidUserPodPath
      // TODO: should we ask to save unsaved changes first?
      commit('ADD_OBSERVATION', { user, userPodPath })
    },

    /**
     * activates an observation given by its uri
     * @param {[type]} commit  [description]
     * @param {[type]} uri     [description]
     */
    setActiveObservation ({ commit }, uri) {
      commit('ACTIVATE_THING', uri)
    },

    /**
     * activates a musicalMaterial given by its uri
     * @param {[type]} commit  [description]
     * @param {[type]} uri     [description]
     */
    setActiveMusMat ({ commit }, uri) {
      commit('ACTIVATE_THING', uri)
    },

    /**
     * activates an extract given by its uri, also activates selection mode
     * @param {[type]} commit  [description]
     * @param {[type]} uri     [description]
     */
    setActiveExtract ({ commit }, uri) {
      commit('ACTIVATE_THING', uri)
      commit('SET_SELECTION_MODE_ACTIVE', true)
    },

    /**
     * generic function to activate a thing by its uri
     * @param  {[type]} commit               [description]
     * @param  {[type]} uri                  [description]
     * @return {[type]}        [description]
     */
    activateThing ({ commit }, uri) {
      // console.log('activating ', uri)
      commit('ACTIVATE_THING', uri)
    },

    /**
     * removes the activation of a given type
     * @param  {[type]} commit               [description]
     * @param  {[type]} type                 [description]
     * @return {[type]}        [description]
     */
    deActivateThing ({ commit }, type) {
      let activationType = null
      if (type === bithTypes.observation) {
        activationType = 'observation'
      } else if (type === bithTypes.musicalMaterial) {
        activationType = 'musicalMaterial'
      } else if (type === bithTypes.extract) {
        activationType = 'extract'
      } else if (type === bithTypes.selection) {
        activationType = 'selection'
      }

      if (activationType !== null) {
        commit('DEACTIVATE_THING', activationType)
      } else {
        console.log('ERROR: deactivation for thing of type ' + type + ' impossible.')
      }
    },

    // TODO: Is this really used???
    /**
     * startEditing will copy the provided _and all linked things_ to
     * currentThings
     * @param  {[type]} commit               [description]
     * @param  {[type]} type                 [description]
     * @param  {[type]} id                   [description]
     * @return {[type]}        [description]
     */
    startEditing ({ commit, rootState }, uri) {
      const userState = rootState.user
      const userPodPath = userState.solidUserPodPath

      commit('START_EDITING', { uri, userPodPath })
    },

    /**
     * will move the provided thing to currentThings, potential children are ignored
     * @param  {[type]} commit               [description]
     * @param  {[type]} thing                [description]
     * @return {[type]}        [description]
     */
    makeCurrent ({ commit, rootState }, thing) {
      const userState = rootState.user
      const userPodPath = userState.solidUserPodPath

      commit('MOVE_TO_CURRENT_THINGS', { thing, userPodPath })
    },

    // not used
    /* setAnnotationTarget ({ commit, state, dispatch }, id) {
      const observations = Object.values(state.currentThings.observation)
      if (observations.length === 0) {
        return null
      }
      const currentObservationId = Object.keys(state.currentThings.observation)[0]

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
          object: state.currentThings.musicalMaterial[existingMusMat]
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
        object: state.thingStore.musicalMaterial[id]
      })
    }, */

    /**
     * used by Verovio to toggle selections
     * @param  {[type]} commit                  [description]
     * @param  {[type]} state                   [description]
     * @param  {[type]} rootState               [description]
     * @param  {[type]} id                      the MEI @xml:id which is to be added to the current selection
     * @return {[type]}           [description]
     */
    selectionToggle ({ commit, state, rootState }, id) {
      if (state.activated.selection === null) {
        const extractThing = state.currentThings[state.activated.extract]

        if (extractThing === undefined) {
          return false
        }

        const urls = getUrlAll(extractThing, pref.frbr + 'rdfs')

        if (urls.length > 0) {
          // console.log('trying to activate selection. following thing should be an ID / uri: ', urls[0])
          commit('ACTIVATE_THING', urls[0])
        } else {
          const userState = rootState.user
          const user = userState.solidSession.info.webId
          const userPodPath = userState.solidUserPodPath
          commit('ADD_NEW_SELECTION_TO_CURRENT_EXTRACT', { user, userPodPath })
        }
      }
      commit('TOGGLE_SELECTION', id)
      // console.log('selectionToggle for ' + id)
    },

    /**
     * used by OpenSeadragon to create new selections
     * @param  {[type]} commit               [description]
     * @param  {[type]} state                [description]
     * @param  {[type]} uri                  the IIIF link (including media fragment) that's to be toggled
     * @return {[type]}        [description]
     */
    addFacsimileSelection ({ commit, state, rootState }, uri) {
      // const userState = rootState.user
      // const webId = userState.solidSession.info.webId
      // const podPath = userState.solidUserPodPath
      // commit('ADD_NEW_SELECTION_TO_CURRENT_EXTRACT', { webId, podPath })
      commit('TOGGLE_SELECTION', uri)
      // commit('TOGGLE_FACSIMILE_URI_AT_ACTIVATED_SELECTION', uri)
    },

    /**
     * used by OpenSeadragon when a user clicks on a measure
     * @param  {[type]} commit               [description]
     * @param  {[type]} state                [description]
     * @param  {[type]} rootState            [description]
     * @param  {[type]} uri                  fileURI + '#' + measureID
     * @return {[type]}        [description]
     */
    clickMeasure ({ commit, state, rootState }, uri) {
      if (state.activated.selection !== null && state.currentThings[state.activated.selection] !== undefined) {
        // console.log('toggle measure selection')
        commit('TOGGLE_SELECTION', uri)
        // commit('TOGGLE_FACSIMILE_URI_AT_ACTIVATED_SELECTION', uri)
      } else {
        console.log('ignoring measure click')
      }
    },

    /**
     * changes a property in a specified thing
     * @param  {[type]} commit                [description]
     * @param  {[type]} state                 [description]
     * @param  {[type]} payload               [description]
     * @return {[type]}         [description]
     */
    changeCurrentDataObject ({ commit, state }, payload) {
      console.log('changeCurrentDataObject', payload)
      if (payload.type in bithTypes && payload.uri && payload.prop && payload.method && payload.val) {
        console.log('committing')
        commit('CHANGE_CURRENT_THING', payload)
      }
    },

    /**
     * saves changes by uploading them to the user's pod and retrieving an updated copy
     * @param  {[type]} commit                  [description]
     * @param  {[type]} state                   [description]
     * @param  {[type]} dispatch                [description]
     * @param  {[type]} rootState               [description]
     * @return {[type]}           [description]
     */
    async saveChanges ({ commit, state, dispatch, rootState }) {
      const userState = rootState.user
      // const user = userState.solidSession.info.webId
      // const userPod = userState.solidUserPod // this could be used instead
      const userPodPath = userState.solidUserPodPath
      const authFetch = userState.solidSession.fetch

      const allThings = new Map()
      let ds = createSolidDataset()

      Object.entries(state.thingStore).forEach(object => {
        allThings.set(object[0], object[1])
      })
      Object.entries(state.currentThings).forEach(object => {
        allThings.set(object[0], object[1])
      })

      allThings.forEach((thing, uri) => {
        ds = setThing(ds, thing)
      })

      // first try to save data
      try {
        saveSolidDatasetAt(
          userPodPath,
          ds,
          { fetch: authFetch }
        ).then(res => {
          console.log('uploaded dataset at ' + userPodPath + ' with ' + allThings.size + ' things')

          // if successful, retrieve updated data and replace local info
          // (as recommended by https://docs.inrupt.com/developer-tools/api/javascript/solid-client/modules/resource_solidDataset.html#savesoliddatasetat)
          loadPod(userPodPath, commit, authFetch, true)
          commit('EMPTY_CURRENT_THINGS')
          console.log('storing data complete')
        }).catch(resErr => {
          console.log('ERRORED: ' + resErr)
        })
      } catch (err) {
        console.log('ERROR: Unable to save data at ' + userPodPath + ' for strange errors: ' + err)
      }
    },

    /**
     * discards changes by reverting currentThings
     * @param  {[type]} commit               [description]
     * @return {[type]}        [description]
     */
    discardChanges ({ commit }) {
      commit('EMPTY_CURRENT_THINGS')
    },

    // unused
    /* createDataObject ({ commit, state, rootState }, payload) {
      const userState = rootState.user

      if (payload.type in state.thingStore && payload.object) {
        const authFetch = userState.solidSession.fetch
        const ds = payload.object
        // const uri = getThingAll(ds)[0].url
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
            console.log('successfully uploaded ' + uri)
            // after upload to SolidPod store in Vuex
            commit('ADD_TO_THINGSTORE', payload)
          })
        } catch (err) {
          console.error('could not upload to ' + uri, err)
        }
      }
    }, */

    /**
     * adds or removes extracts, musMats or observations to either musMats or observations.
     * assumes the target uri to be the only thing in currentThings.
     * @param  {[type]} commit                  [description]
     * @param  {[type]} state                   [description]
     * @param  {[type]} dispatch                [description]
     * @param  {[type]} uri                     the uri of the thing that's supposed to be added or removed
     * @param  {[type]} operation               whether to add or remove the uri
     * @return {[type]}           [description]
     */
    toggleUriAtCurrentThing ({ commit, state, dispatch, rootState }, { uri, operation }) {
      if (operation !== 'add' && operation !== 'remove') {
        console.error('unknown operation: ' + operation)
        return false
      }

      const curObKeys = []
      const curMmKeys = []

      const userPodPath = rootState.user.solidUserPodPath

      console.log('trying to add to ' + userPodPath)

      Object.values(state.currentThings).forEach(thing => {
        const type = (getUrl(thing, pref.rdf + 'type') !== null) ? getUrl(thing, pref.rdf + 'type') : getStringNoLocale(thing, pref.rdf + 'type')

        if (type === bithTypes.observation) {
          curObKeys.push(asUrl(thing, userPodPath))
        } else if (type === bithTypes.musicalMaterial) {
          curMmKeys.push(asUrl(thing, userPodPath))
        }
      })

      let thingUri
      let thingType

      if (curObKeys.length > 0) {
        thingUri = curObKeys[0]
        thingType = bithTypes.observation
      } else if (curMmKeys.length > 0) {
        thingUri = curMmKeys[0]
        thingType = bithTypes.musicalMaterial
      }

      console.log('thingUri: ' + thingUri + ' | thingType: ' + thingType)

      if (thingType === bithTypes.observation) {
        const method = (operation === 'add') ? 'addUrl' : 'removeUrl' // TODO: Can an observation have multiple targets?
        console.log('dispatch addition on observation')
        dispatch('changeCurrentDataObject', {
          type: thingType,
          uri: thingUri, // TODO: uri
          prop: pref.oa + 'hasTarget',
          method,
          val: uri
        })
      } else if (thingType === bithTypes.musicalMaterial) {
        console.log('dispatch addition on musMat')
        const method = (operation === 'add') ? 'addUrl' : 'removeUrl'
        dispatch('changeCurrentDataObject', {
          type: thingType,
          uri: thingUri,
          prop: pref.frbr + 'embodiment',
          method,
          val: uri
        })
      }
    }
  },
  getters: {
    /**
     * returns all things of a given type
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    allThingsByType: (state, getters, rootState) => (type) => {
      const userPodPath = rootState.user.solidUserPodPath
      if (type in bithTypes) {
        const arr = []
        const map = new Map()

        Object.entries(state.thingStore).forEach(object => {
          const iteratedType = (getUrl(object[1], pref.rdf + 'type') !== null) ? getUrl(object[1], pref.rdf + 'type') : getStringNoLocale(object[1], pref.rdf + 'type')
          if (iteratedType === type) {
            map.set(object[0], object[1])
          }
        })

        Object.entries(state.currentThings).forEach(object => {
          const iteratedType = (getUrl(object[1], pref.rdf + 'type') !== null) ? getUrl(object[1], pref.rdf + 'type') : getStringNoLocale(object[1], pref.rdf + 'type')
          if (iteratedType === type) {
            map.set(object[0], object[1])
          }
        })

        map.forEach((thing, uri) => {
          arr.push(thing)
        })

        arr.sort((a, b) => {
          const dateA = getDate(a, pref.dct + 'created')
          const dateB = getDate(b, pref.dct + 'created')

          const dateCompare = new Date(dateB) - new Date(dateA)
          if (dateCompare === 0) {
            const idA = asUrl(a, userPodPath) // getStringNoLocale(thingA, pref.rdfs + 'label')
            const idB = asUrl(b, userPodPath) // getStringNoLocale(thingB, pref.rdfs + 'label')
            const idCompare = (idA < idB) ? -1 : (idA > idB) ? 1 : 0
            return idCompare
          } else {
            return dateCompare
          }
        })
        return arr
      } else {
        console.error('Unknown type ' + type)
        return []
      }
    },

    /**
     * returns all IDs of things of a given type
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    allThingIDsByType: (state) => (type) => {
      if (type in bithTypes) {
        const arr = []
        const map = new Map()

        Object.entries(state.thingStore).forEach(object => {
          const iteratedType = (getUrl(object[1], pref.rdf + 'type') !== null) ? getUrl(object[1], pref.rdf + 'type') : getStringNoLocale(object[1], pref.rdf + 'type')

          if (iteratedType === type) {
            map.set(object[0], object[1])
          }
        })

        Object.entries(state.currentThings).forEach(object => {
          const iteratedType = (getUrl(object[1], pref.rdf + 'type') !== null) ? getUrl(object[1], pref.rdf + 'type') : getStringNoLocale(object[1], pref.rdf + 'type')

          if (iteratedType === type) {
            map.set(object[0], object[1])
          }
        })

        map.forEach((thing, uri) => {
          arr.push(uri)
        })
      } else {
        console.error('Unknown type ' + type)
        return []
      }
    },

    /**
     * returns an object by type and ID
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    thingByTypeAndID: (state) => (type, id) => {
      if (type in bithTypes) {
        const thing = state.thingStore[id]
        if (getUrl(thing, pref.rdf + 'type') === type) {
          return thing
        } else {
          return null
        }
      } else {
        console.error('Unknown type ' + type)
        return null
      }
    },

    /**
     * returns current things by type
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    currentThingsByType: (state, getters, rootState) => (type) => {
      // const userPodPath = rootState.user.solidUserPodPath

      if (type in bithTypes) {
        const arr = []

        Object.values(state.currentThings).forEach(thing => {
          const iteratedType = (getUrl(thing, pref.rdf + 'type') !== null) ? getUrl(thing, pref.rdf + 'type') : getStringNoLocale(thing, pref.rdf + 'type')

          if (iteratedType === type) {
            arr.push(thing)
          }
        })

        /* arr.sort((a, b) => {
          const dateA = getDate(a, pref.dct + 'created')
          const dateB = getDate(b, pref.dct + 'created')

          const dateCompare = new Date(dateB) - new Date(dateA)
          if (dateCompare === 0) {
            const idA = asUrl(a, userPodPath) // getStringNoLocale(thingA, pref.rdfs + 'label')
            const idB = asUrl(b, userPodPath) // getStringNoLocale(thingB, pref.rdfs + 'label')
            const idCompare = (idA < idB) ? -1 : (idA > idB) ? 1 : 0
            return idCompare
          } else {
            return dateCompare
          }
        }) */
        return arr
      } else {
        console.error('Unknown type ' + type)
        return []
      }
    },

    /**
     * returns the ID of the currently active thing by type
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    activeThingIDByType: (state) => (type) => {
      if (type === bithTypes.observation) {
        return state.activated.observation
      } else if (type === bithTypes.musicalMaterial) {
        return state.activated.musicalMaterial
      } else if (type === bithTypes.extract) {
        return state.activated.extract
      } else if (type === bithTypes.selection) {
        return state.activated.selection
      } else {
        console.error('Unknown type ' + type)
        return null
      }
    },

    /**
     * returns a current object by type, ID taken from activated value
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    currentThingByType: (state) => (type) => {
      if (type === bithTypes.observation) {
        return state.currentThings[state.activated.observation]
      } else if (type === bithTypes.musicalMaterial) {
        return state.currentThings[state.activated.musicalMaterial]
      } else if (type === bithTypes.extract) {
        return state.currentThings[state.activated.extract]
      } else if (type === bithTypes.selection) {
        return state.currentThings[state.activated.selection]
      } else {
        console.error('Unknown type ' + type)
        return null
      }
    },

    /**
     * returns a current object by type and ID
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    currentThingByTypeAndID: (state) => (type, id) => {
      if (type in bithTypes) {
        return state.currentThings[id]
      } else {
        console.error('Unknown type ' + type)
        return null
      }
    },

    /**
     * returns all things on one-level down in the hierarchy
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    childrenByTypeAndID: (state) => (type, id) => {
      return getChildren(state, id)
    },

    /**
     * returns all parent IDs
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    parentIDsByTypeAndId: (state, getters, rootState) => (type, id) => {
      const userPodPath = rootState.user.solidUserPodPath
      const parents = getParents(state, id)
      const arr = []
      parents.forEach(thing => {
        arr.push(asUrl(thing, userPodPath))
      })
      return arr
    },

    /**
     * retrieve label of current extract
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    workingExtractLabel: (state) => (id) => {
      const thing = state.currentThings[id]
      const label = getStringNoLocale(thing, pref.rdfs + 'label')

      return label
    },

    /**
     * returns whether the thing is listed in state.currentThings or not
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    thingIsInModification: (state) => (thingId, thingType) => {
      if (thingType in bithTypes) {
        return thingId in state.currentThings
      } else {
        console.error('Unknown type: ' + thingType)
      }
    },

    /**
     * returns if thing is in currentThings
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    thingIsCurrentByTypeAndID: (state) => (thingType, thingId) => {
      if (thingType in bithTypes) {
        return thingId in state.currentThings
      } else {
        console.error('Unknown type: ' + thingType)
        return false
      }
    },

    /**
     * if app is in selectionMode
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    selectionModeActive: (state) => {
      return state.activated.selection !== null
    },

    /**
     * get all selections from currentThings
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    currentSelections: state => {
      const arr = []

      Object.values(state.currentThings).forEach(thing => {
        const iteratedType = (getUrl(thing, pref.rdf + 'type') !== null) ? getUrl(thing, pref.rdf + 'type') : getStringNoLocale(thing, pref.rdf + 'type')

        if (iteratedType === bithTypes.selection) {
          arr.push(thing)
        }
      })

      return arr
    },

    /**
     * retrieves all selections that select from a given resource uri
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    allSelectionsForUri: (state) => (uri) => {
      const arr = []

      Object.entries(state.thingStore).forEach(entry => {
        const iteratedType = (getUrl(entry[1], pref.rdf + 'type') !== null) ? getUrl(entry[1], pref.rdf + 'type') : getStringNoLocale(entry[1], pref.rdf + 'type')

        if (iteratedType === bithTypes.selection) {
          const urls = getUrlAll(entry[1], pref.frbr + 'part')

          urls.forEach(idRef => {
            if (idRef.startsWith(uri) && arr.indexOf(idRef) === -1) {
              arr.push(idRef)
            }
          })
        }
      })

      Object.entries(state.currentThings).forEach(entry => {
        const iteratedType = (getUrl(entry[1], pref.rdf + 'type') !== null) ? getUrl(entry[1], pref.rdf + 'type') : getStringNoLocale(entry[1], pref.rdf + 'type')

        if (iteratedType === bithTypes.selection) {
          const urls = getUrlAll(entry[1], pref.frbr + 'part')

          urls.forEach(idRef => {
            if (idRef.startsWith(uri) && arr.indexOf(idRef) === -1) {
              arr.push(idRef)
            }
          })
        }
      })

      return arr
    },

    /**
     * retrieves all current selections affecting a given uri
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    currentSelectionsForUri: (state) => (uri) => {
      const arr = []
      const map = new Map()

      Object.entries(state.currentThings).forEach(entry => {
        const iteratedType = (getUrl(entry[1], pref.rdf + 'type') !== null) ? getUrl(entry[1], pref.rdf + 'type') : getStringNoLocale(entry[1], pref.rdf + 'type')

        if (iteratedType === bithTypes.selection) {
          const urls = getUrlAll(entry[1], pref.frbr + 'part')

          urls.forEach(idRef => {
            if (idRef.startsWith(uri)) {
              map.set(entry[0], entry[1])
            }
          })
        }
      })

      map.forEach((thing, uri) => {
        arr.push(uri)
      })

      return arr
    },

    // not used?
    /* allSelectionsForCurrentMusMat: (state) => (uri) => {
      if (state.currentMusMat === null) {
        return []
      }
      const arr = []
      try {
        const musMatDS = state.currentThings.musicalMaterial[state.currentMusMat]
        const musMatThing = getThingAll(musMatDS)[0]

        const extractIDs = getUrlAll(musMatThing, pref.frbr + 'embodiment')
        extractIDs.forEach(extractId => {
          const extractDS = state.currentThings.extract[extractId]
          const extractThing = getThingAll(extractDS)[0]

          const selectionIDs = getUrlAll(extractThing, pref.frbr + 'embodiment')
          selectionIDs.forEach(selectionId => {
            const selectionDS = state.currentThings.selection[selectionId]
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
    }, */

    /**
     * retrieves all selection paths for the activated extract
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    allSelectionsForActiveExtract: (state) => (uri) => {
      const arr = []

      if (state.activated.extract === null) {
        return arr
      }

      try {
        const selections = getChildren(state, state.activated.extract)

        selections.forEach(selection => {
          const parts = getUrlAll(selection, pref.frbr + 'part')
          parts.forEach(idRef => {
            if (idRef.startsWith(uri)) {
              arr.push(idRef)
            }
          })
        })
      } catch (err) {}

      return arr
    },

    /**
     * retrieves all selection paths for the activated selection
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    allSelectionsForActiveSelection: (state) => (uri) => {
      const arr = []

      if (state.activated.selection === null) {
        return arr
      }

      try {
        const thing = state.currentThings[state.activated.selection] !== undefined ? state.currentThings[state.activated.selection] : state.thingStore[state.activated.selection]

        const parts = getUrlAll(thing, pref.frbr + 'part')
        parts.forEach(idRef => {
          if (idRef.startsWith(uri)) {
            arr.push(idRef)
          }
        })
      } catch (err) {}

      return arr
    },

    /**
     * retrieves all extracts that have selections affecting the currently shown
     * arrangements, plus the active extract (necessary for creating new
     * extracts). Returned array is ordered
     * @param  {[type]} state                   [description]
     * @param  {[type]} getters                 [description]
     * @param  {[type]} rootState               [description]
     * @return {[type]}           [description]
     */
    extractsForViewedArrangements: (state, getters, rootState) => {
      const userPodPath = rootState.user.solidUserPodPath
      const views = rootState.app.views
      const arrangementUris = []

      views.forEach(view => {
        if ('iiifTilesources' in view?.arrangement) {
          view.arrangement.iiifTilesources.forEach(uri => {
            if (arrangementUris.indexOf(uri) === -1) {
              arrangementUris.push(uri.replace('http://', 'https://'))
            }
          })
          // arrangementUris.push(view.arrangement.iiif)
        }
        if ('MEI' in view?.arrangement && view.arrangement.MEI !== false) {
          if (arrangementUris.indexOf(view.arrangement.MEI) === -1) {
            arrangementUris.push(view.arrangement.MEI.replace('http://', 'https://'))
          }
        }
      })

      const arr = []
      const selectionMap = new Map()
      const extractMap = new Map()

      Object.entries(state.thingStore).forEach(object => {
        const iteratedType = (getUrl(object[1], pref.rdf + 'type') !== null) ? getUrl(object[1], pref.rdf + 'type') : getStringNoLocale(object[1], pref.rdf + 'type')
        if (iteratedType === bithTypes.selection) {
          const partUris = getUrlAll(object[1], pref.frbr + 'part')

          partUris.forEach(idRef => {
            arrangementUris.forEach(arrangementUri => {
              if (idRef.replace('http://', 'https://').startsWith(arrangementUri)) {
                selectionMap.set(object[0], object[1])
              }
            })
          })
        }
      })

      Object.entries(state.currentThings).forEach(object => {
        const iteratedType = (getUrl(object[1], pref.rdf + 'type') !== null) ? getUrl(object[1], pref.rdf + 'type') : getStringNoLocale(object[1], pref.rdf + 'type')
        if (iteratedType === bithTypes.selection) {
          const partUris = getUrlAll(object[1], pref.frbr + 'part')
          partUris.forEach(idRef => {
            arrangementUris.forEach(arrangementUri => {
              if (idRef.replace('http://', 'https://').startsWith(arrangementUri)) {
                selectionMap.set(object[0], object[1])
              }
            })
          })
        }
      })

      if (state.activated.extract !== null) {
        const storedThing = state.thingStore[state.activated.extract]
        if (storedThing !== undefined) {
          extractMap.set(state.activated.extract, storedThing)
        }
        const currentThing = state.currentThings[state.activated.extract]
        if (currentThing !== undefined) {
          extractMap.set(state.activated.extract, currentThing)
        }
      }

      selectionMap.forEach((thing, uri) => {
        const parents = getParents(state, uri)
        parents.forEach(extract => {
          const parentExtractID = asUrl(extract, userPodPath)
          extractMap.set(parentExtractID, extract)
        })
      })

      extractMap.forEach((extract, uri) => {
        arr.push(extract)
      })

      // order extracts
      /* arr.sort((a, b) => {
        const thingA = getThingAll(a)[0]
        const dateA = getDate(thingA, pref.dct + 'created')
        const thingB = getThingAll(b)[0]
        const dateB = getDate(thingB, pref.dct + 'created')

        const dateCompare = new Date(dateB) - new Date(dateA)
        if (dateCompare === 0) {
          const labelA = getStringNoLocale(thingA, pref.rdfs + 'label')
          const labelB = getStringNoLocale(thingB, pref.rdfs + 'label')
          const labelCompare = (labelA < labelB) ? -1 : (labelA > labelB) ? 1 : 0
          return labelCompare
        } else {
          return dateCompare
        }
     }) */
      return arr
    },

    /**
     * retrieves all image region selections on a given page
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    facsimileSelectionsByViewIndex: (state, getters, rootState) => (index) => {
      const userPodPath = rootState.user.solidUserPodPath
      const view = rootState.app.views[index]
      const uri = view?.state?.pageUri

      if (typeof uri !== 'string') {
        return []
      }

      const foundSelections = {}

      if (uri === undefined) {
        console.error('\n\nno uri provided')
        return []
      }

      const pageUri = uri.replace('http://', 'https://')
      const getXywh = (selectionUrl) => {
        return selectionUrl.split('#xywh=').at(-1).split(',') // selectionUrl.split('/').at(-4).split(',')
      }

      // console.log('searching for ' + pageUri)

      Object.entries(state.thingStore).forEach(object => {
        const iteratedType = (getUrl(object[1], pref.rdf + 'type') !== null) ? getUrl(object[1], pref.rdf + 'type') : getStringNoLocale(object[1], pref.rdf + 'type')

        if (iteratedType === bithTypes.selection) {
          const selectionID = object[0]
          const partUris = getUrlAll(object[1], pref.frbr + 'part')

          partUris.forEach((idRef, index) => {
            const selectionUrl = idRef.replace('http://', 'https://')
            if (selectionUrl.startsWith(pageUri)) {
              const xywh = getXywh(selectionUrl)
              const hit = {
                id: selectionID,
                uri: selectionUrl,
                x: parseInt(xywh[0]),
                y: parseInt(xywh[1]),
                w: parseInt(xywh[2]),
                h: parseInt(xywh[3]),
                index,
                classList: [],
                extracts: {}
              }
              if (selectionID in foundSelections) {
                foundSelections[selectionID].push(hit)
              } else {
                foundSelections[selectionID] = [hit]
              }

              if (state.activated.selection === selectionID) {
                foundSelections[selectionID][index].classList.push('activeSelection')
              }

              const extracts = getParents(state, selectionID)
              extracts.forEach(extract => {
                const extractID = asUrl(extract, userPodPath)
                foundSelections[selectionID][index].extracts[extractID] = true
                if (state.activated.extract === extractID) {
                  foundSelections[selectionID][index].classList.push('activeExtract')
                }
              })
            }
          })
        }
      })

      // get all selections from currentThings
      Object.entries(state.currentThings).forEach(object => {
        const iteratedType = (getUrl(object[1], pref.rdf + 'type') !== null) ? getUrl(object[1], pref.rdf + 'type') : getStringNoLocale(object[1], pref.rdf + 'type')

        if (iteratedType === bithTypes.selection) {
          const selectionID = object[0]
          const partUris = getUrlAll(object[1], pref.frbr + 'part')

          partUris.forEach((idRef, index) => {
            const selectionUrl = idRef.replace('http://', 'https://')
            if (selectionUrl.startsWith(pageUri)) {
              if (foundSelections[selectionID] === undefined) {
                foundSelections[selectionID] = [{
                  id: selectionID,
                  uri: selectionUrl,
                  index,
                  classList: [],
                  extracts: {}
                }]
              } else {
                foundSelections[selectionID].push({
                  id: selectionID,
                  uri: selectionUrl,
                  index,
                  classList: [],
                  extracts: {}
                })
              }

              const xywh = getXywh(selectionUrl)

              foundSelections[selectionID][index].x = parseInt(xywh[0])
              foundSelections[selectionID][index].y = parseInt(xywh[1])
              foundSelections[selectionID][index].w = parseInt(xywh[2])
              foundSelections[selectionID][index].h = parseInt(xywh[3])
              foundSelections[selectionID][index].classList.push('current')

              if (state.activeSelection === selectionID && foundSelections[selectionID][index].classList.indexOf('activeSelection') === -1) {
                foundSelections[selectionID][index].classList.push('activeSelection')
              }

              const extracts = getParents(state, selectionID)
              extracts.forEach(extract => {
                const extractID = asUrl(extract, userPodPath)
                foundSelections[selectionID][index].extracts[extractID] = true
                if (state.activated.extract === extractID) {
                  foundSelections[selectionID][index].classList.push('activeExtract')
                }
              })
            }
          })
        }
      })

      return Object.values(foundSelections)
    },

    /**
     * gets all selections with measures on current facsimile page
     * @param  {[type]} state                   [description]
     * @param  {[type]} getters                 [description]
     * @param  {[type]} rootState               [description]
     * @return {[type]}           [description]
     */
    allMeasureSelectionsOnCurrentFacsimilePage: (state, getters, rootState) => (index) => {
      const userPodPath = rootState.user.solidUserPodPath
      const view = rootState.app.views[index]

      if (view === undefined || !('arrangement' in view)) {
        return {}
      }

      const arrangement = view.arrangement
      let meiUri

      if (arrangement.MEI === false) {
        return {}
      } else {
        meiUri = arrangement.MEI
      }
      const pageUri = view?.state?.pageUri

      const meiString = rootState.app?.meiCache[meiUri]
      if (meiString === undefined || pageUri === undefined) {
        return {}
      }

      const mei = parser.parseFromString(meiString, 'application/xml')
      const surface = mei.querySelector('graphic[target="' + pageUri + '"]').closest('surface')
      const zones = surface.querySelectorAll('zone')
      const measures = []

      zones.forEach(zone => {
        const zoneId = zone.getAttribute('xml:id')
        const elem = mei.querySelector('measure[facs~="#' + zoneId + '"]')
        const measureUri = meiUri + '#' + elem.getAttribute('xml:id')
        measures.push(measureUri)
      })

      const obj = {}

      Object.entries(state.thingStore).forEach(object => {
        const iteratedType = (getUrl(object[1], pref.rdf + 'type') !== null) ? getUrl(object[1], pref.rdf + 'type') : getStringNoLocale(object[1], pref.rdf + 'type')

        if (iteratedType === bithTypes.selection && object[0] !== 'undefined') {
          const selectionId = object[0]
          const thing = object[1]

          const urls = getUrlAll(thing, pref.frbr + 'part')
          const isActivatedSelection = state.activated.selection === selectionId

          let isActivatedExtract = false

          const extracts = getParents(state, selectionId)
          extracts.forEach(extract => {
            const extractID = asUrl(extract, userPodPath)
            if (state.activated.extract === extractID) {
              isActivatedExtract = true
            }
          })

          urls.forEach(idRef => {
            if (measures.indexOf(idRef) !== -1) {
              obj[idRef] = {}
              obj[idRef][selectionId] = ['selection']
              if (isActivatedSelection) {
                obj[idRef][selectionId].push('activeSelection')
              }
              if (isActivatedExtract) {
                obj[idRef][selectionId].push('activeExtract')
              }
            }
          })
        }
      })

      Object.entries(state.currentThings).forEach(object => {
        try {
          const iteratedType = (getUrl(object[1], pref.rdf + 'type') !== null) ? getUrl(object[1], pref.rdf + 'type') : getStringNoLocale(object[1], pref.rdf + 'type')
          if (iteratedType === bithTypes.selection) {
            const selectionId = object[0]
            const thing = object[1]
            const urls = getUrlAll(thing, pref.frbr + 'part')
            const isActivatedSelection = state.activated.selection === selectionId
            let isActivatedExtract = false
            const extracts = getParents(state, selectionId)
            extracts.forEach(extract => {
              const extractID = asUrl(extract, userPodPath)
              if (state.activated.extract === extractID) {
                isActivatedExtract = true
              }
            })

            urls.forEach(idRef => {
              if (measures.indexOf(idRef) !== -1) {
                if (obj[idRef] === undefined) {
                  obj[idRef] = {}
                  obj[idRef][selectionId] = ['current']
                  if (isActivatedSelection) {
                    obj[idRef][selectionId].push('activeSelection')
                  }
                  if (isActivatedExtract) {
                    obj[idRef][selectionId].push('activeExtract')
                  }
                } else {
                  obj[idRef][selectionId].push('current')
                  if (isActivatedSelection) {
                    obj[idRef][selectionId].push('activeSelection')
                  }
                  if (isActivatedExtract) {
                    obj[idRef][selectionId].push('activeExtract')
                  }
                }
              }
            })
          }
        } catch (err) {

        }
      })

      return obj
    },

    /**
     * retrieve arrangement from extract. Problem: This retrieves measures only,
     * not IIIF resources. For that, we don't seem to have all info required
     * (link to page's info.json only, not manifest.json)
     * @param  {[type]} state                   [description]
     * @param  {[type]} getters                 [description]
     * @param  {[type]} rootState               [description]
     * @return {[type]}           [description]
     */
    arrangementByExtract: (state, getters, rootState) => (extractID) => {
      const userPodPath = rootState.user.solidUserPodPath
      const arrangements = rootState.graph.arrangements
      const tileSources = []

      arrangements.forEach(arr => {
        if (arr.tileSources) {
          tileSources.push(JSON.parse(JSON.stringify(arr.iiifTilesources)))
        }
      })

      const extract = state.currentThings[extractID] !== undefined ? state.currentThings[extractID] : state.thingStore[extractID]

      const fileUrls = []
      const selections = getChildren(state, asUrl(extract, userPodPath))
      selections.forEach(thing => {
        const selectionUrls = getUrlAll(thing, pref.frbr + 'part')
        selectionUrls.forEach(url => {
          if (url.indexOf('#') !== -1) {
            fileUrls.push(url.split('#')[0])
          } else {
            fileUrls.push(url)
          }
        })
      })

      const arrangement = arrangements.find((arr, i) => {
        // console.log('comparing', fileUrls, tileSources[i])

        if (fileUrls.indexOf(arr.MEI) !== -1) {
          return true
        }

        // get references by facsimile rectangles
        let iiifHit = false
        if (tileSources[i] !== undefined && tileSources[i].length > 0) {
          fileUrls.forEach(url => {
            tileSources[i].forEach(tileSource => {
              if (url.replace('http://', 'https://').startsWith(tileSource.replace('http://', 'https://'))) {
                iiifHit = true
              }
            })
          })
        }
        // console.log('found iiifHit: ' + iiifHit)
        return iiifHit
      })
      // console.log('found arrangement: ', arrangement)
      return arrangement
    },

    /**
     * in annotationMode, returns arrays with IDs of things which are linked
     * from the currentThings
     * @param  {[type]} state                   [description]
     * @param  {[type]} getters                 [description]
     * @param  {[type]} rootState               [description]
     * @return {[type]}           [description]
     */
    affectedByCurrentAnnot: (state, getters, rootState) => {
      const obj = { observation: [], musicalMaterial: [], extract: [], selection: [] }
      if (!rootState.app.annotationTool.visible) {
        return obj
      }

      const current = []
      let type

      Object.entries(state.currentThings).forEach(object => {
        const uri = object[0]
        const thing = object[1]

        const iteratedType = (getUrl(thing, pref.rdf + 'type') !== null) ? getUrl(thing, pref.rdf + 'type') : getStringNoLocale(thing, pref.rdf + 'type')

        if (iteratedType === bithTypes.observation || iteratedType === bithTypes.musicalMaterial || iteratedType === bithTypes.extract) {
          current.push(uri)
          type = iteratedType
        }
      })

      // if there are too many or too few things, return empty arrays
      if (current.length !== 1) {
        return obj
      }

      const mainThing = state.currentThings[current[0]]

      if (type === bithTypes.observation) {
        const predicate = getPredicateByType(type)
        // console.log(57, predicate)
        const allTargets = getUrlAll(mainThing, predicate)

        allTargets.forEach(target => {
          const type = getTypeById(state, target)

          if (type !== null) {
            // console.log('-- target ' + target + ' is of type ' + type)
            // console.log(obj)
            obj[simplifiedTypeByType(type)].push(target)
          } else {
            console.error('Unable to retrieve type of ' + target)
          }
        })
      } else if (type === bithTypes.musicalMaterial) {
        const predicate = getPredicateByType(type)
        // console.log(67)
        // const children = getChildren(state, mainDS, type)
        // console.log(children)
        obj.extract = getUrlAll(mainThing, predicate)
        // console.log(68)
      }

      return obj
    },

    /**
     * in annotationMode, returns arrays with IDs of things which are linked
     * from the active annot
     * @param  {[type]} state                   [description]
     * @param  {[type]} getters                 [description]
     * @param  {[type]} rootState               [description]
     * @return {[type]}           [description]
     */
    affectedByActiveAnnot: (state, getters, rootState) => {
      const obj = { observation: [], musicalMaterial: [], extract: [], selection: [] }
      if (!rootState.app.annotationTool.visible) {
        return obj
      }

      const current = []
      // let type
      if (state.activated.observation !== null) {
        current.push(state.activated.observation)
        // type = bithTypes.observation
      }

      if (state.activated.musicalMaterial !== null) {
        current.push(state.activated.musicalMaterial)
        // type = bithTypes.musicalMaterial
      }

      if (state.activated.extract !== null) {
        current.push(state.activated.extract)
        // type = bithTypes.extract
      }

      // if there are too many or too few things, return empty arrays
      if (current.length !== 1) {
        return obj
      }

      const mainThing = state.thingStore[current[0]]
      // if this is a newly created thing, not yet stored to the Pod
      if (mainThing === undefined) {
        return obj
      }

      const followLinks = (obj, thingUri) => {
        const children = getChildren(state, thingUri)
        children.forEach(childThing => {
          const childId = asUrl(childThing, rootState.user.solidUserPodPath)
          const type = getTypeById(state, childId)
          const simpleType = simplifiedTypeByType(type)

          obj[simpleType].push(childId)
          followLinks(obj, childId)
        })
      }
      const simpleType = simplifiedTypeByType(getTypeById(state, current[0]))
      obj[simpleType].push(current[0])
      followLinks(obj, current[0])

      return obj
    },

    /**
     * return previewItems for annotationView
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    previewItems: (state, getters) => {
      const selections = getters.affectedByActiveAnnot.selection
      const arr = []

      const selectionMap = new Map()

      selections.forEach(selection => {
        const thing = state.currentThings[selection] !== undefined ? state.currentThings[selection] : state.thingStore[selection]
        const urls = getUrlAll(thing, pref.frbr + 'part')

        const fileMap = selectionMap.has(selection) ? selectionMap.get(selection) : selectionMap.set(selection, new Map()).get(selection)

        urls.forEach(part => {
          const fileURI = (part.indexOf('#') !== -1) ? part.split('#')[0] : part

          if (fileMap.has(fileURI)) {
            fileMap.get(fileURI).push(part)
          } else {
            fileMap.set(fileURI, [part])
          }
        })

        fileMap.forEach((partArray, fileUri) => {
          const obj = { fileUri, selection, parts: partArray }

          const iiifArrangement = getters.arrangements.find(arrangement => {
            return arrangement.iiifTilesources && arrangement.iiifTilesources.indexOf(fileUri) !== -1
          })
          const transcriptionArrangement = getters.arrangements.find(arrangement => {
            return arrangement.MEI === fileUri
          })

          if (iiifArrangement) {
            obj.type = 'facsimile'
            obj.arrangement = { label: iiifArrangement.shortTitle, id: iiifArrangement.id }
          }
          if (transcriptionArrangement) {
            obj.type = 'transcription'
            obj.arrangement = { label: transcriptionArrangement.shortTitle, id: transcriptionArrangement.id }
          }

          arr.push(obj)
          /* getters.arrangements.forEach(arrangement => {
            const objects = []

            const iiifParts = partArray.filter(part => {

            })

            if (arrangement.iiifTilesources && arrangement.iiifTilesources.indexOf(fileURI) !== -1) {
              obj.type = 'facsimile'
              obj.pageIndex = arrangement.iiifTilesources.indexOf(fileURI)
              obj.arrangement = { label: arrangement.shortTitle, id: arrangement.id }
            }

            if (arrangement.MEI === fileURI) {
              obj.type = 'transcription'
              obj.fileUri = fileURI
              obj.arrangement = { label: arrangement.shortTitle, id: arrangement.id }
            }
            // replace content of fileMap with proper objects now
            fileMap.set(fileUri, objects)
          })
          arr.push(obj)

          // determine if iiif or transcript */
        })
      })

      /* const parts = []

      // retrieve all parts
      selections.forEach(selection => {
        const thing = state.currentThings[selection] !== undefined ? state.currentThings[selection] : state.thingStore[selection]
        const urls = getUrlAll(thing, pref.frbr + 'part')

        urls.forEach(part => parts.push({ part, selection }))
      })

      parts.forEach(obj => {
        const fileURI = (obj.part.indexOf('#') !== -1) ? obj.part.split('#')[0] : obj.part

        getters.arrangements.forEach(arrangement => {
          if (arrangement.MEI === fileURI) {
            obj.type = 'transcription'
            obj.fileUri = fileURI
            obj.arrangement = { label: arrangement.shortTitle, id: arrangement.id }
          }

          if (arrangement.iiifTilesources && arrangement.iiifTilesources.indexOf(fileURI) !== -1) {
            obj.type = 'facsimile'
            obj.pageIndex = arrangement.iiifTilesources.indexOf(fileURI)
            obj.arrangement = { label: arrangement.shortTitle, id: arrangement.id }
          }
        })
        arr.push(obj)
      })
      */

      return arr
    },

    /**
     * in annotationMode, returns info which things can be edited
     * @param  {[type]} state                   [description]
     * @param  {[type]} getters                 [description]
     * @param  {[type]} rootState               [description]
     * @return {[type]}           [description]
     */
    ableToBeEdited: (state, getters, rootState) => {
      const obj = { observation: false, musicalMaterial: false, extract: false }
      if (!rootState.app.annotationTool.visible) {
        return obj
      }

      const current = []
      let type

      Object.entries(state.currentThings).forEach(object => {
        const uri = object[0]
        const thing = object[1]

        const iteratedType = (getUrl(thing, pref.rdf + 'type') !== null) ? getUrl(thing, pref.rdf + 'type') : getStringNoLocale(thing, pref.rdf + 'type')

        if (iteratedType === bithTypes.observation || iteratedType === bithTypes.musicalMaterial || iteratedType === bithTypes.extract) {
          current.push(uri)
          type = iteratedType
        }
      })

      // if there are too many or too few things, return empty arrays
      if (current.length !== 1) {
        return obj
      }

      if (type === bithTypes.observation) {
        obj.observation = true
        obj.musicalMaterial = true
        obj.extract = true
      } else if (type === bithTypes.musicalMaterial) {
        obj.extract = true
      }
      return obj
    }
  }
}
