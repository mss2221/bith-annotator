import { prefix } from '@/meld/prefixes.js'

import {
  buildThing,
  createThing,
  createSolidDataset,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getThingAll,
  getUrl,
  getUrlAll,
  saveSolidDatasetAt,
  setThing
} from '@inrupt/solid-client'

/**
 * [loadListing description]
 * @param  {[type]} listingPath               [description]
 * @param  {[type]} commit                    [description]
 * @return {[type]}             [description]
 */
const loadListing = async (listingPath, commit, authFetch) => {
  const listing = await getSolidDataset(
    listingPath, // File in Pod to Read
    { fetch: authFetch } // fetch from authenticated session
  )
  commit('SET_SOLID_FILE_LISTING', listing)

  const thing = getThingAll(listing)[0]
  const uris = getUrlAll(thing, prefix.ldp + 'contains')
  console.log('Listing exists at ' + listingPath + ' exists. \nNeed to retrieve the following URIs:', uris)

  uris.forEach(async uri => {
    const ds = await getSolidDataset(
      uri, // File in Pod to Read
      { fetch: authFetch } // fetch from authenticated session
    )
    const thing = getThingAll(ds)[0]
    const type = getUrl(thing, prefix.rdf + 'type')
    const annotType = getStringNoLocale(thing, prefix.rdf + 'type')

    // todo: no support for annotations yet
    if (annotType === 'Annotation') {
      commit('ADD_TO_ANNOTSTORE', { type: 'observation', object: ds })
    } else if (type === 'https://example.com/Terms/MusicalMaterial') {
      commit('ADD_TO_ANNOTSTORE', { type: 'musicalMaterial', object: ds })
    } else if (type === 'https://example.com/Terms/Extract') {
      commit('ADD_TO_ANNOTSTORE', { type: 'extract', object: ds })
    } else if (type === 'https://example.com/Terms/Selection') {
      commit('ADD_TO_ANNOTSTORE', { type: 'selection', object: ds })
    } else {
      // console.log('\n\n\nFound something strange: ', type, annotType, ds)
    }
  })
}

export const userModule = {
  state: () => ({
    solidSession: null,
    solidUser: null,
    solidFileListung: null,
    solidFileListingPath: null
  }),
  mutations: {
    SET_SOLID_SESSION (state, session) {
      state.solidSession = session
    },
    SET_SOLID_USERNAME (state, username) {
      state.solidUser = username
    },
    SET_SOLID_FILE_LISTING (state, listing) {
      state.solidFileListing = listing
    },
    SET_SOLID_LISTING_PATH (state, listingPath) {
      state.solidFileListingPath = listingPath
    }
  },
  actions: {
    setSolidSession ({ commit }, session) {
      commit('SET_SOLID_SESSION', session)

      try {
        const webId = session.info.webId
        const authFetch = session.fetch

        async function getUserName () {
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
            prefix.foaf + 'name'
          )

          commit('SET_SOLID_USERNAME', name)

          const listingPath = webId.split('/profile/card')[0] + '/public/bith/listing.ttl'
          commit('SET_SOLID_LISTING_PATH', listingPath)

          try {
            await loadListing(listingPath, commit, authFetch)
          } catch (err) {
            console.log('No listing available at ' + listingPath + '. Creating a new one. \nMessage: ' + err)

            let ds = createSolidDataset()

            const thing = buildThing(createThing({ name: listingPath }))
              .addUrl(prefix.rdf + 'type', prefix.ldp + 'Container')
              .build()

            ds = setThing(ds, thing)

            saveSolidDatasetAt(
              listingPath,
              ds,
              {
                fetch: authFetch
              }
            ).then(res => {
              console.log('Initialized file listing at ' + listingPath, res)
              commit('SET_SOLID_FILE_LISTING', ds)
            })
          }
        }
        getUserName()
      } catch (err) {
        console.log('ERROR retrieving username: ' + err)
      }
    }
  },
  getters: {
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
    solidId: state => {
      return state.solidSession?.info?.webId
    },
    isLoggedIn: state => {
      return state.solidSession !== null
    }
  }
}
