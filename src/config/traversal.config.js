import { prefix as pref } from '@/meld/prefixes.js'

export const graphURI = 'https://beta.domestic-beethoven.eu/rdf/BitHCollection.jsonld' // 'http://localhost:8082/rdf/BitHCollection.jsonld'

export const params = {
  numHops: 3,
  followPropertyUri: [
    pref.bibo + 'shortTitle',
    pref.dbpedia + 'genre',
    '@id',
    '@type',
    '@value',
    pref.gndo + 'arranger',
    pref.gndo + 'opusNumericDesignationOfMusicalWork',
    pref.dce + 'publisher',
    pref.gndo + 'dateOfPublication',
    pref.frbr + 'embodiment',
    pref.rdau + 'P60163',
    pref.rdau + 'O60242',
    pref.wdt + 'P217',
    pref.rdfs + 'label',
    pref.ldp + 'contains'
  ],
  ignoreObjectPrefix: ['http://d-nb.info/gnd/', 'http://rdaregistry.info/']
}

export const traversalObjectives = [
  {
    '@embed': '@always',
    'http://rdaregistry.info/Elements/u/P60242': {}
  },
  {
    '@type': pref.bith + 'MusicalMaterial'
  }
]

export const MAX_TRAVERSERS = 5
