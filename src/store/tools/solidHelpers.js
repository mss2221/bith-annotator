import {
  buildThing,
  // createSolidDataset,
  createThing,
  getThingAll,
  getUrlAll,
  getUrl,
  getStringNoLocale,
  // setThing,
  asUrl
} from '@inrupt/solid-client'

import { prefix as pref } from '@/meld/prefixes'
import { bithTypes } from '@/meld/constants.js'

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * [getPublicIdFromDataStructure description]
 * @param  {[type]} ds               [description]
 * @return {[type]}    [description]
 */
export const getPublicIdFromDataStructure = (ds) => {
  // console.log(ds)
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
 * generates a new annotation / observation thing in its final place
 * @param  {[type]} user                      the webId of the user
 * @param  {[type]} userPodPath               the uri of the file containing all things
 * @return {[type]}             [description]
 */
export const getAnnotThing = (user, userPodPath) => {
  const date = new Date()
  const id = uuidv4()

  const thing = buildThing(createThing({ name: id, uri: userPodPath }))
    .addStringNoLocale(pref.rdf + 'type', 'Annotation')
    .addDate(pref.dct + 'created', date)
    .addUrl(pref.dct + 'creator', user)
    .addStringNoLocale(pref.oa + 'Motivation', 'describing')
    .addStringNoLocale(pref.oa + 'bodyValue', '')
    .build()

  return thing

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

/**
 * generates a new musical Material thing in its final place
 * @param  {[type]} user               [description]
 * @param  {[type]} userPodPath               the uri of the file containing all things
 * @return {[type]}      [description]
 */
export const getMusMatThing = (user, userPodPath) => {
  const date = new Date()
  const id = uuidv4()

  const thing = buildThing(createThing({ name: id, uri: userPodPath }))
    .addUrl(pref.rdf + 'type', pref.bithTerms + 'MusicalMaterial')
    .addDate(pref.dct + 'created', date)
    .addUrl(pref.dct + 'creator', user)
    .addStringNoLocale(pref.rdfs + 'label', '')
    .build()

  return thing
}

/**
 * generates a new extract thing in its final place
 * @param  {[type]} user                      the webId of the user
 * @param  {[type]} userPodPath               the uri of the file containing all things
 * @return {[type]}             [description]
 */
export const getExtractThing = (user, userPodPath) => {
  const date = new Date()
  const id = uuidv4()

  const thing = buildThing(createThing({ name: id, uri: userPodPath }))
    .addUrl(pref.rdf + 'type', pref.bithTerms + 'Extract')
    .addDate(pref.dct + 'created', date)
    .addUrl(pref.dct + 'creator', user)
    .addStringNoLocale(pref.rdfs + 'label', '[new extract]')
    .build()

  return thing

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

/**
 * generates a new selection thing in its final place
 * @param  {[type]} user                      the webId of the user
 * @param  {[type]} userPodPath               the uri of the file containing all things
 * @return {[type]}             [description]
 */
export const getSelectionThing = (user, userPodPath) => {
  const date = new Date()
  const id = uuidv4()

  const thing = buildThing(createThing({ name: id, uri: userPodPath }))
    .addUrl(pref.rdf + 'type', pref.bithTerms + 'Selection')
    .addDate(pref.dct + 'created', date)
    .addUrl(pref.dct + 'creator', user)
    .addStringNoLocale(pref.rdfs + 'label', '[new selection]')
    .build()

  return thing

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
 * resets info about activated things
 * @param {[type]} state  [description]
 */
export const resetActivations = (state) => {
  populateActivations(state, null, null, null, null)
}

/**
 * populates the activated things
 * @param  {[type]} state                         [description]
 * @param  {[type]} observation                   [description]
 * @param  {[type]} musicalMaterial               [description]
 * @param  {[type]} extract                       [description]
 * @param  {[type]} selection                     [description]
 * @return {[type]}                 [description]
 */
export const populateActivations = (state, observation, musicalMaterial, extract, selection) => {
  state.activated = {
    observation,
    musicalMaterial,
    extract,
    selection
  }
}

/**
 * empties the currentThings object
 * @param  {[type]} state               [description]
 * @return {[type]}       [description]
 */
export const emptyCurrentThings = (state) => {
  state.currentThings = {}
}

/**
 * loads an array of things into the currentThings object
 * @param  {[type]} state                [description]
 * @param  {[type]} things               the sold things
 * @return {[type]}        [description]
 */
export const makeThingsCurrent = (state, things, userPodPath) => {
  things.forEach(thing => {
    const uri = asUrl(thing, userPodPath)
    state.currentThings[uri] = thing
  })
}

/**
 * provides a mapping between object types and relationships to "lower" entities
 * @param  {[type]} type               [description]
 * @return {[type]}      [description]
 */
export const getPredicateByType = (type) => {
  if (type === bithTypes.observation) {
    return pref.oa + 'hasTarget'
  }

  if (type === bithTypes.musicalMaterial) {
    return pref.frbr + 'embodiment'
  }

  if (type === bithTypes.extract) {
    return pref.frbr + 'embodiment'
  }

  if (type === bithTypes.selection) {
    return pref.frbr + 'part'
  }
}

/**
 * provides a mapping between object types and relationships that "higher" entities have
 * @param  {[type]} type               [description]
 * @return {[type]}      [description]
 */
export const getParentPredicateByType = (type) => {
  if (type === bithTypes.extract) {
    return pref.frbr + 'embodiment'
  }

  if (type === bithTypes.selection) {
    return pref.frbr + 'embodiment'
  }
}

/**
 * get child types. Observations may attach to different things
 * @param  {[type]} type               [description]
 * @return {[type]}      [description]
 */
export const getChildType = (type) => {
  if (type === bithTypes.musicalMaterial) {
    return bithTypes.extract
  }

  if (type === bithTypes.extract) {
    return bithTypes.selection
  }

  return ''
}

/**
 * get all children
 * @param  {[type]} state               [description]
 * @param  {[type]} uri                  [description]
 * @return {[type]}       [description]
 */
export const getChildren = (state, uri) => {
  const thing = state.currentThings[uri] !== undefined ? state.currentThings[uri] : state.thingStore[uri]
  const type = (getUrl(thing, pref.rdf + 'type') !== null) ? getUrl(thing, pref.rdf + 'type') : getStringNoLocale(thing, pref.rdf + 'type')
  const predicate = getPredicateByType(type)

  const arr = []

  const childrenUris = getUrlAll(thing, predicate)
  childrenUris.forEach(childUri => {
    const childThing = state.currentThings[childUri] !== undefined ? state.currentThings[childUri] : state.thingStore[childUri]
    if (childThing !== undefined) {
      arr.push(childThing)
    }
  })

  return arr
}

/**
 * get all parents from selections (-> extracts) or extracts (-> musicalMaterials)
 * @param  {[type]} state               [description]
 * @param  {[type]} uri                  [description]
 * @return {[type]}       [description]
 */
export const getParents = (state, uri) => {
  const thing = state.currentThings[uri] !== undefined ? state.currentThings[uri] : state.thingStore[uri]
  const type = (getUrl(thing, pref.rdf + 'type') !== null) ? getUrl(thing, pref.rdf + 'type') : getStringNoLocale(thing, pref.rdf + 'type')
  const predicate = getParentPredicateByType(type)

  const types = [bithTypes.observation, bithTypes.musicalMaterial, bithTypes.extract, bithTypes.selection]
  const parentIndex = types.indexOf(type) - 1
  const parentType = types[parentIndex]

  if (parentIndex <= 0) {
    // console.log('An item of type ' + type + ' has no children')
    return []
  }

  const arr = []
  const map = new Map()

  Object.entries(state.thingStore).forEach(object => {
    const iteratedType = getUrl(object[1], pref.rdf + 'type')

    if (iteratedType === parentType) {
      const childrenIDs = getUrlAll(object[1], predicate)

      if (childrenIDs.indexOf(uri) !== -1) {
        map.set(object[0], object[1])
      }
    }
  })

  Object.entries(state.currentThings).forEach(object => {
    const iteratedType = getUrl(object[1], pref.rdf + 'type')

    if (iteratedType === parentType) {
      const childrenIDs = getUrlAll(object[1], predicate)

      if (childrenIDs.indexOf(uri) !== -1) {
        map.set(object[0], object[1])
      }
    }
  })

  map.forEach((thing, uri) => {
    arr.push(thing)
  })

  return arr
}

/**
 * returns the type of a thing by examining its ID. Returns null if no type can
 * be found
 * @param  {[type]} state               [description]
 * @param  {[type]} uri                 [description]
 * @return {[type]}    [description]
 */
export const getTypeById = (state, uri) => {
  const thing = state.currentThings[uri] !== undefined ? state.currentThings[uri] : state.thingStore[uri]
  const type = (getUrl(thing, pref.rdf + 'type') !== null) ? getUrl(thing, pref.rdf + 'type') : getStringNoLocale(thing, pref.rdf + 'type')

  if (type === 'Annotation') {
    return bithTypes.observation
  } else if (type in bithTypes) {
    return type
  } else {
    return null
  }
}

/**
 * helper method to retrieve simplified type from bithType
 * @param  {[type]} type               [description]
 * @return {[type]}      [description]
 */
export const simplifiedTypeByType = (type) => {
  if (type === bithTypes.observation) {
    return 'observation'
  } else if (type === bithTypes.musicalMaterial) {
    return 'musicalMaterial'
  } else
  if (type === bithTypes.extract) {
    return 'extract'
  } else
  if (type === bithTypes.selection) {
    return 'selection'
  }
  return type
}
