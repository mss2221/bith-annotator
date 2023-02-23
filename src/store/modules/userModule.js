import { prefix } from '@/meld/prefixes.js'

import {
  // buildThing,
  // createThing,
  createSolidDataset,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getThingAll,
  // getUrl,
  // getUrlAll,
  saveSolidDatasetAt //,
  // setThing
} from '@inrupt/solid-client'

/**
 * loads the data from a given file
 * @param  {[type]}  userPodPath               [description]
 * @param  {[type]}  commit                    [description]
 * @param  {[type]}  authFetch                 [description]
 * @param  {Boolean} ownPod                [whether this is the users own Pod or not]
 * @return {Promise}             [description]
 */
export const loadPod = async (userPodPath, commit, authFetch, ownPod) => {
  const userPod = await getSolidDataset(
    userPodPath, // File in Pod to Read
    { fetch: authFetch } // fetch from authenticated session
  )

  // if loading foreign pods, don't empty local stuff
  if (ownPod) {
    // preserve userPod
    commit('SET_USER_POD', userPod)

    // empty any existing data (with every save, local data is updated from server)
    commit('EMPTY_THINGSTORE')
  }

  const things = getThingAll(userPod)

  things.forEach(thing => {
    commit('ADD_TO_THINGSTORE', { thing, userPodPath })
  })
}

export const userModule = {
  state: () => ({
    solidSession: null,
    solidUser: null,
    solidUserPod: null,
    solidUserPodPath: null
  }),
  mutations: {
    SET_SOLID_SESSION (state, session) {
      state.solidSession = session
    },
    SET_SOLID_USERNAME (state, username) {
      state.solidUser = username
    },
    SET_USER_POD (state, ds) {
      state.solidUserPod = ds
    },
    SET_USER_POD_PATH (state, path) {
      state.solidUserPodPath = path
    }
  },
  actions: {
    setSolidSession ({ commit }, session) {
      commit('SET_SOLID_SESSION', session)

      try {
        const webId = session.info.webId
        const authFetch = session.fetch

        async function initialize () {
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

          const userPodPath = webId.split('/profile/card')[0] + '/public/bith.ttl'
          commit('SET_USER_POD_PATH', userPodPath)

          try {
            await loadPod(userPodPath, commit, authFetch, true)
          } catch (err) {
            console.log('No userPod available at ' + userPodPath + '. Creating a new one. \nMessage: ' + err)

            const userPod = createSolidDataset()

            // global statement of the pod could go in here
            /* const thing = buildThing(createThing({ name: userPodPath }))
              .addUrl(prefix.rdf + 'type', prefix.ldp + 'Container')
              .build()

            ds = setThing(ds, thing) */

            saveSolidDatasetAt(
              userPodPath,
              userPod,
              {
                fetch: authFetch
              }
            ).then(res => {
              console.log('Initialized userPod at ' + userPodPath, res)
              commit('SET_SOLID_FILE_LISTING', userPod)
            })
          }
        }
        initialize()
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
    dataBaseUrl: state => {
      return state.solidUserPodPath
    },
    solidId: state => {
      return state.solidSession?.info?.webId
    },
    isLoggedIn: state => {
      return state.solidSession !== null
    }
  }
}
