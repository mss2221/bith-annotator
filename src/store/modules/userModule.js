import { prefix } from '@/meld/prefixes.js'
import { publicPodPath } from '@/config/traversal.config.js'

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
  console.log('trying to load data from ' + userPodPath)
  const userPod = await getSolidDataset(
    userPodPath, // File in Pod to Read
    { fetch: authFetch } // fetch from authenticated session
  )

  // if loading foreign pods, don't empty local stuff
  if (ownPod) {
    // preserve userPod
    commit('SET_USER_POD', userPod)

    // empty any existing data (with every save, local data is updated from server)
    // TODO: This was included to avoid problems with deleting things, but this isn't supported anyway.
    // Removing this commit will allow multiple pods to be loaded.
    // commit('EMPTY_THINGSTORE')
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
            if (userPodPath !== publicPodPath) {
              await loadPod(publicPodPath, commit, authFetch, false)
            }

            // load additional pods if requested
            const uriParams = new URLSearchParams(window.location.search)
            const extraPods = uriParams.get('pods')
            console.log('extraPods: ', extraPods)
            if (extraPods !== null) {
              const extraPodsDecoded = decodeURIComponent(extraPods)
              const extraPodsArray = extraPodsDecoded.split(',')
              console.log('requested to load external pod(s): ', extraPodsArray)

              extraPodsArray.forEach(async podUri => {
                try {
                  if (podUri !== publicPodPath && podUri !== userPodPath) {
                    await loadPod(podUri, commit, authFetch, false)
                  }
                } catch (err) {
                  console.error('ERROR loading additional SolidPod from ' + podUri + ': ' + err)
                }
              })
            } else {
              console.log('no additional pod(s) requested')
            }

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
