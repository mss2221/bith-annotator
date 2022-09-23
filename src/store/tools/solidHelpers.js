import {
  buildThing,
  createSolidDataset,
  createThing,
  getThingAll,
  getUrlAll,
  setThing
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

// creates an annotation stub
export const getAnnotDS = (user) => {
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
export const getMusMatDS = (user) => {
  const date = new Date()
  // const date = d.toISOString()
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/musicalMaterials/' + plainId + '.ttl'

  let ds = createSolidDataset()

  const thing = buildThing(createThing({ name: id }))
    .addUrl(pref.rdf + 'type', pref.bithTerms + 'MusicalMaterial')
    .addDate(pref.dct + 'created', date)
    .addStringNoLocale(pref.dct + 'creator', user)
    .addStringNoLocale(pref.rdfs + 'label', '')
    // .addUrl(pref.frbr + 'embodiment','http://test1.com/ads')
    // .addUrl(pref.frbr + 'embodiment','http://test2.com/sad')
    .build()

  ds = setThing(ds, thing)

  return ds
}

export const getExtractDS = (user) => {
  const date = new Date()
  // const date = d.toISOString()
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/extracts/' + plainId + '.ttl'

  let ds = createSolidDataset()

  const thing = buildThing(createThing({ name: id }))
    .addUrl(pref.rdf + 'type', pref.bithTerms + 'Extract')
    .addDate(pref.dct + 'created', date)
    .addStringNoLocale(pref.dct + 'creator', user)
    .addStringNoLocale(pref.rdfs + 'label', '[new extract]')
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

export const getSelectionDS = (user) => {
  const date = new Date()
  // const date = d.toISOString()
  const plainId = uuidv4()
  const id = user.split('/profile/')[0] + '/public/bith/selections/' + plainId + '.ttl'

  let ds = createSolidDataset()

  const thing = buildThing(createThing({ name: id }))
    .addUrl(pref.rdf + 'type', pref.bithTerms + 'Selection')
    .addDate(pref.dct + 'created', date)
    .addStringNoLocale(pref.dct + 'creator', user)
    .addStringNoLocale(pref.rdfs + 'label', '[new selection]')
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
 * empties the currentAnnot object
 * @param  {[type]} state               [description]
 * @return {[type]}       [description]
 */
export const emptyCurrentAnnot = (state) => {
  populateCurrentAnnot(state, {}, {}, {}, {})
}

/**
 * populates the currentAnnot object
 * @param  {[type]} state                         [description]
 * @param  {[type]} observation                   [description]
 * @param  {[type]} musicalMaterial               [description]
 * @param  {[type]} extract                       [description]
 * @param  {[type]} selection                     [description]
 * @return {[type]}                 [description]
 */
export const populateCurrentAnnot = (state, observation, musicalMaterial, extract, selection) => {
  state.currentAnnot = {
    observation,
    musicalMaterial,
    extract,
    selection
  }
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
 * @param  {[type]} ds                  [description]
 * @param  {[type]} type                [description]
 * @return {[type]}       [description]
 */
export const getChildren = (state, ds, type) => {
  const thing = getThingAll(ds)[0]
  const predicate = getPredicateByType(type)

  const arr = []

  const types = [bithTypes.observation, bithTypes.musicalMaterial, bithTypes.extract, bithTypes.selection]
  const nextIndex = types.indexOf(type) + 1

  if (nextIndex > types.length - 1) {
    // console.log('An item of type ' + type + ' has no children')
    return []
  }

  const childType = types[nextIndex]

  const childrenIDs = getUrlAll(thing, predicate)
  childrenIDs.forEach(childID => {
    const currentChildDS = state.currentAnnot[childType][childID]
    const childDS = currentChildDS !== undefined ? currentChildDS : state.annotStore[childType][childID]
    arr.push(childDS)
  })

  return arr
}

/**
 * get all parents from selections (-> extracts) or extracts (-> musicalMaterials)
 * @param  {[type]} state               [description]
 * @param  {[type]} ds                  [description]
 * @param  {[type]} type                [description]
 * @return {[type]}       [description]
 */
export const getParents = (state, ds, type) => {
  const id = getPublicIdFromDataStructure(ds)
  const predicate = getParentPredicateByType(type)

  const parents = {}

  const types = [bithTypes.observation, bithTypes.musicalMaterial, bithTypes.extract, bithTypes.selection]
  const parentIndex = types.indexOf(type) - 1

  if (parentIndex <= 0) {
    // console.log('An item of type ' + type + ' has no children')
    return []
  }

  const parentType = types[parentIndex]

  Object.values(state.annotStore[parentType]).forEach(parentDS => {
    const parentId = getPublicIdFromDataStructure(parentDS)
    const thing = getThingAll(parentDS)[0]
    const childrenIDs = getUrlAll(thing, predicate)

    if (childrenIDs.indexOf(id) !== -1) {
      parents[parentId] = parentDS
    }
  })

  Object.values(state.currentAnnot[parentType]).forEach(parentDS => {
    const parentId = getPublicIdFromDataStructure(parentDS)
    const thing = getThingAll(parentDS)[0]
    const childrenIDs = getUrlAll(thing, predicate)

    if (childrenIDs.indexOf(id) !== -1) {
      parents[parentId] = parentDS
    }
  })

  return Object.values(parents)
}

/**
 * returns the type of a thing by examining its ID. Returns null if no type can
 * be found
 * @param  {[type]} state               [description]
 * @param  {[type]} id               [description]
 * @return {[type]}    [description]
 */
export const getTypeById = (state, id) => {
  if (Object.keys(state.annotStore.selection).indexOf(id) !== -1) {
    return bithTypes.selection
  }

  if (Object.keys(state.annotStore.extract).indexOf(id) !== -1) {
    return bithTypes.extract
  }

  if (Object.keys(state.annotStore.musicalMaterial).indexOf(id) !== -1) {
    return bithTypes.musicalMaterial
  }

  if (Object.keys(state.annotStore.observation).indexOf(id) !== -1) {
    return bithTypes.observation
  }

  if (Object.keys(state.currentAnnot.selection).indexOf(id) !== -1) {
    return bithTypes.selection
  }

  if (Object.keys(state.currentAnnot.extract).indexOf(id) !== -1) {
    return bithTypes.extract
  }

  if (Object.keys(state.currentAnnot.musicalMaterial).indexOf(id) !== -1) {
    return bithTypes.musicalMaterial
  }

  if (Object.keys(state.currentAnnot.observation).indexOf(id) !== -1) {
    return bithTypes.observation
  }

  return null
}
