/**
 * Various constants used throughout the project.
 * @type {Object}
 */
const constants = {
  SET_TRAVERSAL_OBJECTIVES: 'SET_TRAVERSAL_OBJECTIVES',
  APPLY_TRAVERSAL_OBJECTIVE: 'APPLY_OBJECTIVE',
  HAS_BODY: 'oa:hasBody',
  FETCH_SCORE: 'FETCH_SCORE',
  FETCH_RIBBON_CONTENT: 'FETCH_RIBBON_CONTENT',
  FETCH_CONCEPTUAL_SCORE: 'FETCH_CONCEPTUAL_SCORE',
  FETCH_TEI: 'FETCH_TEI',
  FETCH_GRAPH: 'FETCH_GRAPH',
  FETCH_GRAPH_DOCUMENT: 'FETCH_GRAPH_DOCUMENT',
  FETCH_WORK: 'FETCH_WORK',
  FETCH_TARGET_EXPRESSION: 'FETCH_TARGET_EXPRESSION',
  FETCH_COMPONENT_TARGET: 'FETCH_COMPONENT_TARGET',
  PROCESS_COMPONENT_TARGET: 'PROCESS_COMPONENT_TARGET',
  FETCH_STRUCTURE: 'FETCH_STRUCTURE',
  FETCH_MANIFESTATIONS: 'FETCH_MANIFESTATIONS',
  SCORE_PREV_PAGE: 'SCORE_PREV_PAGE',
  SCORE_NEXT_PAGE: 'SCORE_NEXT_PAGE',
  SCORE_SET_OPTIONS: 'SCORE_SET_OPTIONS',
  SCORE_PAGE_TO_TARGET: 'SCORE_PAGE_TO_TARGET',
  PROCESS_ANNOTATION: 'PROCESS_ANNOTATION',
  SESSION_GRAPH_ETAG: 'SESSION_GRAPH_ETAG',
  RESET_NEXT_SESSION_TRIGGER: 'RESET_NEXT_SESSION_TRIGGER',
  TRANSITION_TO_NEXT_SESSION: 'TRANSITION_TO_NEXT_SESSION',
  REGISTER_PUBLISHED_PERFORMANCE_SCORE: 'REGISTER_PUBLISHED_PERFORMANCE_SCORE',
  MUZICODES_UPDATED: 'MUZICODES_UPDATED',
  REALIZATION_OF: 'frbr:realizationOf',
  EXPRESSION: 'frbr:Expression',
  PART_OF: 'frbr:partOf',
  PART: 'frbr:part',
  KEY: 'mo:key',
  HARMONY: 'https://meld.linkedmusic.org/companion/vocab/harmony',
  CADENCE: 'https://meld.linkedmusic.org/companion/vocab/cadentialGoal',
  DEGREE: 'https://meld.linkedmusic.org/companion/vocab/hasDegree',
  CHORD_TYPE: 'https://meld.linkedmusic.org/companion/vocab/chordType',
  HAS_STRUCTURE: 'https://meld.linkedmusic.org/terms/hasStructure',
  SEQ: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq',
  SEQPART: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#_',
  SCORE: 'http://purl.org/ontology/mo/Score',
  CONTAINS: 'http://www.w3.org/ns/ldp#contains',
  MOTIVATED_BY: 'http://www.w3.org/ns/oa#motivatedBy',
  SEGMENT: 'so:Segment',
  MUZICODE: 'meld:Muzicode',
  PUBLISHED_AS: 'http://purl.org/ontology/mo/published_as',
  HAS_PERFORMANCE_MEDIUM: 'http://rdaregistry.info/Elements/e/p20215',
  HAS_PIANO: 'http://id.loc.gov/authorities/performanceMediums/2013015550',
  CREATE_SESSION: 'CREATE_SESSION',
  SESSION_NOT_CREATED: 'SESSION_NOT_CREATED',
  TICK: 'TICK',
  TRAVERSAL_PREHOP: 'TRAVERSAL_PREHOP',
  TRAVERSAL_HOP: 'TRAVERSAL_HOP',
  TRAVERSAL_FAILED: 'TRAVERSAL_FAILED',
  TRAVERSAL_UNNECCESSARY: 'TRAVERSAL_UNNECCESSARY',
  TRAVERSAL_CONSTRAINED: 'TRAVERSAL_CONSTRAINED',
  IGNORE_TRAVERSAL_OBJECTIVE_CHECK_ON_EMPTY_GRAPH: 'IGNORE_TRAVERSAL_OBJECTIVE_CHECK_ON_EMPTY_GRAPH',
  RUN_TRAVERSAL: 'RUN_TRAVERSAL',
  REGISTER_TRAVERSAL: 'REGISTER_TRAVERSAL',
  UPDATE_LATEST_RENDERED_PAGENUM: 'UPDATE_LATEST_RENDERED_PAGENUM',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',

  muzicodesUri: 'http://127.0.0.1:5000/MUZICODES',

  MAX_RETRIES: 3,
  MAX_TRAVERSAL_HOPS: 5,
  RETRY_DELAY: 10
}

export default constants

export const bithTypes = {
  observation: 'Annotation',
  musicalMaterial: 'https://domestic-beethoven.eu/Terms/MusicalMaterial',
  extract: 'https://domestic-beethoven.eu/Terms/Extract',
  selection: 'https://domestic-beethoven.eu/Terms/Selection',
  Annotation: 'Annotation',
  'https://domestic-beethoven.eu/Terms/MusicalMaterial': 'https://domestic-beethoven.eu/Terms/MusicalMaterial',
  'https://domestic-beethoven.eu/Terms/Extract': 'https://domestic-beethoven.eu/Terms/Extract',
  'https://domestic-beethoven.eu/Terms/Selection': 'https://domestic-beethoven.eu/Terms/Selection'
}

export const displayPrefixes = {
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  dct: 'http://purl.org/dc/terms/',
  frbr: 'http://purl.org/vocab/frbr/core#',
  bithTerms: 'https://domestic-beethoven.eu/Terms/',
  xsd: 'http://www.w3.org/2001/XMLSchema#'
}
