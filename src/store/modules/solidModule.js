import { prefix as pref } from '@/meld/prefixes'// 'meld-clients-core/lib/library/prefixes'
import { bithTypes } from '@/meld/constants.js'

import {
  addUrl,
  buildThing,
  getStringNoLocale,
  getThingAll,
  getUrl,
  getUrlAll,
  saveSolidDatasetAt,
  setThing
} from '@inrupt/solid-client'

import { getPublicIdFromDataStructure, getAnnotDS, getMusMatDS, getExtractDS, getSelectionDS, resetActivations, populateActivations, emptyCurrentAnnot, populateCurrentAnnot, getChildren } from '@/store/tools/solidHelpers.js'

export const solidModule = {
  state: () => ({
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
    activated: {
      observation: null,
      musicalMaterial: null,
      extract: null,
      selection: null
    }
  }),
  mutations: {
    SET_SOLID_FILE_LISTING (state, listing) {
      state.solidFileListing = listing
    },
    SET_SOLID_LISTING_PATH (state, listingPath) {
      state.solidFileListingPath = listingPath
    },
    ADD_FILE_TO_SOLID_FILE_LISTING (state, uri) {
      console.log('trying to add ' + uri)
      const existingIndex = state.solidFileListing[pref.ldp + 'contains'].findIndex(item => {
        return item['@id'] === uri
      })
      console.log('index is ' + existingIndex)
      if (existingIndex === -1) {
        const obj = {}
        obj['@id'] = uri
        state.solidFileListing[pref.ldp + 'contains'].push(obj)
      }
      console.log(state.solidFileListing)
    },
    REMOVE_FILE_FROM_SOLID_FILE_LISTING (state, uri) {
      const existingIndex = state.solidFileListing[pref.ldp + 'contains'].findIndex(item => {
        return item['@id'] === uri
      })
      if (existingIndex !== -1) {
        state.solidFileListing[pref.ldp + 'contains'].splice(existingIndex, 1)
      }
    },

    ADD_TO_ANNOTSTORE (state, payload) {
      const type = payload.type
      const obj = payload.object
      const id = getPublicIdFromDataStructure(obj)

      if (type in state.annotStore) {
        state.annotStore[type][id] = obj
      }
    },
    MOVE_TO_CURRENT_ANNOT (state, payload) {
      const type = payload.type
      const obj = payload.object
      const id = getPublicIdFromDataStructure(obj)

      if (type in state.annotStore && !(id in state.currentAnnot[type])) {
        state.currentAnnot[type][id] = obj
      }
    },
    REMOVE_FROM_CURRENT_ANNOT (state, payload) {
      const type = payload.type
      const obj = payload.object
      const id = getPublicIdFromDataStructure(obj)

      if (type in state.annotStore && id in state.currentAnnot[type]) {
        state.currentAnnot[type][id] = undefined
      }
    },
    REMOVE_FROM_ANNOTSTORE (state, payload) {
      const type = payload.type
      const obj = payload.object
      const id = getPublicIdFromDataStructure(obj)

      if (type in state.annotStore) {
        state.annotStore[type][id] = undefined
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
      state.currentAnnot[type][id] = ds
    },

    SET_EDITING (state, mode) {
      // already there
      if (state.editing === mode) {
        return true
      }

      if (mode === null) {
        emptyCurrentAnnot(state)
        resetActivations(state)
      } else if (mode === 'parallelPassage') {
        // starting new parallel passage
        if (state.activated.musicalMaterial === null) {
          const ds = getMusMatDS(state)
          const id = getPublicIdFromDataStructure(ds)

          const musMat = {}
          musMat[id] = ds

          populateCurrentAnnot(state, {}, musMat, {}, {})
          populateActivations(state, null, id, null, null)
        } else {
          // opening existing parallel passage
          const mm = {}
          const ex = {}
          const sel = {}

          const id = state.activated.musicalMaterial
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

          populateCurrentAnnot(state, {}, mm, ex, sel)
          populateActivations(state, null, id, null, null)
        }
      } else if (mode === 'observation') {
        // starting new observation
        if (state.currentObservation === null) {
          const ds = getAnnotDS(state)
          const id = getPublicIdFromDataStructure(ds)

          const observation = {}
          observation[id] = ds

          populateCurrentAnnot(state, observation, {}, {}, {})
          populateActivations(state, id, null, null, null)
        } else {
          // opening existing observation
          const ob = {}
          const mm = {}
          const ex = {}
          const sel = {}

          const id = state.activated.observation
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

          populateCurrentAnnot(state, ob, mm, ex, sel)
          populateActivations(state, id, null, null, null)
        }

        /*
         * stop it here
         */
      }
    },

    START_EDITING (state, { type, id }) {
      const ds = state.annotStore[type][id]
      // const initialType = type

      const types = [bithTypes.observation, bithTypes.musicalMaterial, bithTypes.extract, bithTypes.selection]
      const currentIndex = types.indexOf(type)

      const prefills = [{}, {}, {}, {}]
      const activations = [null, null, null, null]

      prefills[currentIndex][id] = ds
      activations[currentIndex] = id

      const children = getChildren(state, ds, type)

      const resolveChildren = (ds, parentIndex) => {
        const id = getPublicIdFromDataStructure(ds)
        const nextIndex = parentIndex + 1

        if (nextIndex < types.length) {
          prefills[nextIndex][id] = ds
          const nextType = types[nextIndex]
          const children = getChildren(state, ds, nextType)
          /*
          if (initialType === bithTypes.extract
            && nextType === bithTypes.selection
            && children.length > 0) {
            activations[]
          }
          */
          children.forEach((childDS) => {
            resolveChildren(childDS, currentIndex)
          })
        }
      }

      children.forEach((childDS) => {
        resolveChildren(childDS, currentIndex)
      })

      populateCurrentAnnot(state, prefills[0], prefills[1], prefills[2], prefills[3])
      populateActivations(state, activations[0], activations[1], activations[2], activations[3])
    },

    DISCARD_CHANGES (state) {
      populateCurrentAnnot(state, {}, {}, {}, {})
      // populateActivations(state, null, null, null, null)
    },

    ADD_EXTRACT (state, user) {
      const extract = getExtractDS(user)
      const extractId = getPublicIdFromDataStructure(extract)

      state.currentAnnot.extract[extractId] = extract
      state.activated.extract = extractId

      state.activated.selection = null
    },
    ACTIVATE_THING (state, { type, id }) {
      if (type in bithTypes) {
        state.activated[type] = id

        if (type === bithTypes.extract) {
          state.activated[bithTypes.selection] = null
        }
      }
    },
    ADD_NEW_SELECTION_TO_CURRENT_EXTRACT (state, user) {
      const selection = getSelectionDS(user)
      const selectionId = getPublicIdFromDataStructure(selection)

      state.currentAnnot.selection[selectionId] = selection
      state.activated[bithTypes.selection] = selectionId

      let extractDS = state.currentAnnot.extract[state.activated[bithTypes.extract]]
      const extractId = getPublicIdFromDataStructure(extractDS)
      let thing = getThingAll(extractDS)[0]

      thing = buildThing(thing)
        .addUrl(pref.frbr + 'embodiment', selectionId)
        .build()

      extractDS = setThing(extractDS, thing)
      state.currentAnnot.extract[extractId] = extractDS
    },
    TOGGLE_SELECTION (state, id) {
      let selectionDS = state.currentAnnot.selection[state.activated[bithTypes.selection]]
      const selectionId = getPublicIdFromDataStructure(selectionDS)
      let thing = getThingAll(selectionDS)[0]
      console.log('toggling selection')
      const urls = getUrlAll(thing, pref.frbr + 'part')
      console.log(urls)
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
      state.currentAnnot.selection[selectionId] = selectionDS
    }
  },
  actions: {
    addExtract ({ commit, rootState }) {
      const userState = rootState.user
      const webId = userState.solidSession.info.webId
      commit('ADD_EXTRACT', webId)
      commit('ADD_NEW_SELECTION_TO_CURRENT_EXTRACT', webId)
    },
    setActiveObservation ({ commit }, id) {
      commit('ACTIVATE_THING', { type: bithTypes.observation, id })
    },
    setActiveMusMat ({ commit }, id) {
      commit('ACTIVATE_THING', { type: bithTypes.extract, id })
    },
    setActiveExtract ({ commit, state, dispatch }, id) {
      commit('ACTIVATE_THING', { type: bithTypes.extract, id })
      commit('SET_SELECTION_MODE_ACTIVE', true)
    },

    activateThing ({ commit }, { type, id }) {
      commit('ACTIVATE_THING', { type, id })
    },

    startEditing ({ commit }, { type, id }) {
      commit('START_EDITING', { type, id })
    },

    setAnnotationTarget ({ commit, state, dispatch }, id) {
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

    selectionToggle ({ commit, state }, id) {
      if (state.activated.selection === null) {
        console.log(1)
        const extractDS = state.currentAnnot.extract[state.activated[bithTypes.extract]]
        const thing = getThingAll(extractDS)[0]

        const urls = getUrlAll(thing, pref.frbr + 'rdfs')

        if (urls.length > 0) {
          console.log('trying to activate selection. following thing should be an ID / uri: ', urls[0])
          commit('ACTIVATE_THING', { type: bithTypes.selection, id: urls[0] })
        } else {
          commit('ADD_NEW_SELECTION_TO_CURRENT_EXTRACT')
        }
      }
      console.log(2)
      commit('TOGGLE_SELECTION', id)
      console.log(3)
      // console.log('selectionToggle for ' + id)
    },

    changeCurrentDataObject ({ commit, state }, payload) {
      if (payload.type in bithTypes && payload.id && payload.prop && payload.method && payload.val) {
        commit('ADD_TO_CURRENT_ANNOT', payload)
      }
    },

    saveChanges ({ commit, state, dispatch, rootState }) {
      const uris = []
      const userState = rootState.user

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

      let listing = userState.solidFileListing
      const listingPath = userState.solidFileListingPath

      const authFetch = userState.solidSession.fetch
      let thing = getThingAll(listing)[0]
      const existingUris = getUrlAll(thing, pref.ldp + 'contains')

      uris.forEach(uri => {
        if (existingUris.indexOf(uri) === -1) {
          thing = addUrl(thing, pref.ldp + 'contains', uri)
        }
      })

      listing = setThing(listing, thing)

      console.log('\nNeed to update listing. Should be like so now:', uris)

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
      commit('DISCARD_CHANGES')
    },

    discardChanges ({ commit }) {
      commit('DISCARD_CHANGES')
    },

    createDataObject ({ commit, state, rootState }, payload) {
      const userState = rootState.user

      if (payload.type in state.annotStore && payload.object) {
        const authFetch = userState.solidSession.fetch
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
            console.log('successfully uploaded ' + uri)
            // after upload to SolidPod store in Vuex
            commit('ADD_TO_ANNOTSTORE', payload)
          })
        } catch (err) {
          console.error('could not upload to ' + uri, err)
        }
      }
    }
  },
  getters: {
    /**
     * returns all things of a given type
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    allThingsByType: (state) => (type) => {
      if (type in bithTypes) {
        const arr = Object.values(state.annotStore[type])
        const keys = Object.keys(state.annotStore[type])

        Object.entries(state.currentAnnot[type]).forEach(entry => {
          if (keys.indexOf(entry[0]) === -1) {
            arr.push(entry[1])
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
        const arr = Object.keys(state.annotStore[type])
        Object.keys(state.currentAnnot[type]).forEach(key => {
          if (arr.indexOf(key) === -1) {
            arr.push(key)
          }
        })
        return arr
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
        return state.annotStore[type][id]
      } else {
        console.error('Unknown type ' + type)
        return null
      }
    },

    /* observationLabel: (state) => (observationId) => {
      // console.log('searching ' + observationId)
      const observationDS = state.annotStore.observation[observationId]
      const thing = getThingAll(observationDS)[0]

      const target = getUrl(thing, pref.oa + 'hasTarget')

      const musMatDS = state.annotStore.musicalMaterial[target]
      const musMatThing = getThingAll(musMatDS)[0]

      const label = getStringNoLocale(musMatThing, pref.rdfs + 'label')

      return label
    }, */

    /* musicalMaterialLabel: (state) => (musMatId) => {
      console.log('searching ' + musMatId)
      const musMatDS = state.annotStore.musicalMaterial[musMatId]
      const thing = getThingAll(musMatDS)[0]
      const label = getStringNoLocale(thing, pref.rdfs + 'label')

      return label
    }, */

    /* currentAnnot: state => {
      return state.currentAnnot
    }, */

    /* currentObservations: state => {
      return Object.values(state.currentAnnot.observation)
    }, */

    /* currentObservationId: state => {
      return Object.keys(state.currentAnnot.observation)[0]
    }, */

    /* currentObservationBody: state => {
      const observations = Object.values(state.currentAnnot.observation)
      if (observations.length === 0) {
        return null
      }

      const observationDS = observations[0]
      const thing = getThingAll(observationDS)[0]
      const body = getStringNoLocale(thing, pref.oa + 'bodyValue')

      return body
    }, */

    /**
     * returns current things by type
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    currentThingsByType: (state) => (type) => {
      if (type in bithTypes) {
        return Object.values(state.currentAnnot[type])
      } else {
        console.error('Unknown type ' + type)
        return []
      }
    },

    /* currentMusicalMaterialId: state => {
      return Object.keys(state.currentAnnot.musicalMaterial)[0]
    }, */

    /* currentMusicalMaterialLabel: state => {
      const musMats = Object.values(state.currentAnnot.musicalMaterial)
      if (musMats.length === 0) {
        return null
      }

      const musMatDS = musMats[0]
      const thing = getThingAll(musMatDS)[0]
      const label = getStringNoLocale(thing, pref.rdfs + 'label')

      return label
    }, */

    /* currentExtracts: state => {
      return Object.keys(state.currentAnnot.extract)
    }, */

    /**
     * returns the ID of the currently active thing by type
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    activeThingIDByType: (state) => (type) => {
      if (type in bithTypes) {
        return state.activated[type]
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
      if (type in bithTypes) {
        return state.currentAnnot[type][state.activated[type]]
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
        return state.currentAnnot[type][id]
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
      if (type in bithTypes) {
        const currentDS = state.currentAnnot[type][id]
        const ds = currentDS !== undefined ? currentDS : state.annotStore[type][id]

        return getChildren(state, ds, type)
      } else {
        console.error('Unknown type ' + type)
        return []
      }
    },

    /* activeExtractObject: state => {
      return state.currentAnnot.extract[state.currentExtract]
    }, */

    /* workingExtract: (state) => (extractId) => {
      return state.currentAnnot.extract[extractId]
    }, */
    workingExtractLabel: (state) => (extractId) => {
      const extractDS = state.currentAnnot.extract[extractId]
      const thing = getThingAll(extractDS)[0]
      const label = getStringNoLocale(thing, pref.rdfs + 'label')

      return label
    },

    /**
     * returns whether the thing is listed in state.currentAnnot or not
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    thingIsInModification: (state) => (thingId, thingType) => {
      if (thingType in bithTypes) {
        return thingId in state.currentAnnot[thingType]
      } else {
        console.error('Unknown type: ' + thingType)
      }
    },

    /**
     * returns if thing is in currentAnnot
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    thingIsCurrentByTypeAndID: (state) => (thingType, thingId) => {
      if (thingType in bithTypes) {
        return thingId in state.currentAnnot[thingType]
      } else {
        console.error('Unknown type: ' + thingType)
      }
    },

    selectionModeActive: (state) => {
      return state.activated.selection !== null
    },

    currentSelections: state => {
      return Object.values(state.currentAnnot.selection)
    },

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

    /**
     * retrieves all selection paths for the activated extract
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    allSelectionsForActiveExtract: (state) => (uri) => {
      if (state.activated[bithTypes.extract] === null) {
        return []
      }
      const arr = []
      try {
        let extractDS = state.currentAnnot.extract[state.activated[bithTypes.extract]]
        if (extractDS === undefined) {
          extractDS = state.annotStore.extract[state.activated[bithTypes.extract]]
        }
        const extractThing = getThingAll(extractDS)[0]

        const selectionIDs = getUrlAll(extractThing, pref.frbr + 'embodiment')
        selectionIDs.forEach(selectionId => {
          let selectionDS = state.currentAnnot.selection[selectionId]
          if (selectionDS === undefined) {
            selectionDS = state.annotStore.selection[selectionId]
          }
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

    /**
     * retreives all selection paths for the activated selection
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    allSelectionsForActiveSelection: (state) => (uri) => {
      if (state.activated[bithTypes.selection] === null) {
        return []
      }
      const arr = []
      try {
        let selectionDS = state.currentAnnot.selection[state.activated[bithTypes.selection]]
        if (selectionDS === undefined) {
          selectionDS = state.annotStore.selection[state.activated[bithTypes.selection]]
        }
        const selectionThing = getThingAll(selectionDS)[0]

        const parts = getUrlAll(selectionThing, pref.frbr + 'part')
        parts.forEach(idRef => {
          if (idRef.startsWith(uri)) {
            arr.push(idRef)
          }
        })
      } catch (err) {}

      return arr
    },

    extractsForViewedArrangements: (state, getters, rootState) => {
      const views = rootState.app.views
      const uris = []

      views.forEach(view => {
        if ('iiif' in view?.arrangement) {
          uris.push(view.arrangement.iiif)
        }
        if ('MEI' in view?.arrangement) {
          uris.push(view.arrangement.MEI)
        }
      })
      return uris
    }
  }
}
