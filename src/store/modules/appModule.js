export const appModule = {
  state: () => ({
    selectionTool: {
      visible: true
    },
    overviewTool: {
      visible: true
    },
    annotationTool: {
      visible: false
    },
    libraryModalVisible: false,
    landingPageVisible: true,
    views: [],
    ldDetails: '',
    meiCache: {},
    initialLoading: false
  }),
  mutations: {
    SHOW_SELECTION_TOOL (state, bool) {
      state.selectionTool.visible = bool
    },
    SHOW_OVERVIEW_TOOL (state, bool) {
      state.overviewTool.visible = bool
    },
    SHOW_ANNOTATION_TOOL (state, bool) {
      state.annotationTool.visible = bool
    },
    TOGGLE_LIBRARY_MODAL (state) {
      state.libraryModalVisible = !state.libraryModalVisible
    },
    TOGGLE_LANDING_PAGE (state) {
      state.landingPageVisible = !state.landingPageVisible
    },
    ADD_VIEW (state, view) {
    // TODO: think about how to deal with more than 2 views
      state.views = state.views.concat([view])
      // console.log('added new view:', view)
    },
    REMOVE_VIEW (state, index) {
      const arr = [...state.views]
      arr.splice(index, 1)

      state.views = arr
    },
    SET_LD_DETAILS (state, code) {
      state.ldDetails = code
    },
    SET_FACSIMILE_VIEW_CURRENT_PAGE (state, { viewIndex, pageN, pageUri }) {
      state.views[viewIndex].state = { pageN, pageUri }
    },
    SET_VEROVIO_VIEW_CURRENT_MDIV (state, { viewIndex, mdivIndex }) {
      console.log('viewIndex: ' + viewIndex + ' mdivIndex: ' + mdivIndex)
      state.views[viewIndex].state = { mdivIndex }
    },
    CACHE_MEI (state, { uri, mei }) {
      state.meiCache[uri] = mei
    },
    SET_INITIAL_LOADING (state, bool) {
      state.initialLoading = bool
    }
  },
  actions: {
    setSelectionMode ({ commit }) {
      commit('SHOW_SELECTION_TOOL', true)
      commit('SHOW_OVERVIEW_TOOL', true)
      commit('SHOW_ANNOTATION_TOOL', false)
    },
    setAnnotationMode ({ commit }) {
      commit('SHOW_SELECTION_TOOL', false)
      commit('SHOW_OVERVIEW_TOOL', true)
      commit('SHOW_ANNOTATION_TOOL', true)
    },
    toggleLibraryModal ({ commit }) {
      commit('TOGGLE_LIBRARY_MODAL')
    },
    toggleLandingPage ({ commit }) {
      commit('TOGGLE_LANDING_PAGE')
    },
    addView ({ commit }, view) {
      commit('ADD_VIEW', view)
    },
    removeView ({ commit }, index) {
      commit('REMOVE_VIEW', index)
    },
    setLdDetails ({ commit }, code) {
      commit('SET_LD_DETAILS', code)
    },
    announceCurrentPage ({ commit }, { viewIndex, pageN, pageUri }) {
      commit('SET_FACSIMILE_VIEW_CURRENT_PAGE', { viewIndex, pageN, pageUri })
    },
    announceCurrentMdiv ({ commit }, { viewIndex, mdivIndex }) {
      commit('SET_VEROVIO_VIEW_CURRENT_MDIV', { viewIndex, mdivIndex })
    },
    loadMEI ({ commit, state }, uri) {
      return new Promise((resolve, reject) => {
        if (state.meiCache[uri] !== undefined) {
          resolve()
        } else {
          fetch(uri)
            .then(res => res.text())
            .then(mei => {
              commit('CACHE_MEI', { uri, mei })
              resolve()
            })
            .catch(err => {
              console.log('failed to load ' + uri + ': ' + err)
              reject(err)
            })
        }
      })
    },
    setInitialLoading ({ commit }, bool) {
      commit('SET_INITIAL_LOADING', bool)
    }
  },
  getters: {
    selectionToolVisible: state => {
      if (state.landingPageVisible) {
        return false
      }
      return state.selectionTool.visible
    },
    overviewToolVisible: state => {
      if (state.landingPageVisible) {
        return false
      }
      return state.overviewTool.visible
    },
    annotationToolVisible: state => {
      if (state.landingPageVisible) {
        return false
      }
      return state.annotationTool.visible
    },
    libraryModalVisible: state => {
      if (state.landingPageVisible) {
        return false
      }
      return state.libraryModalVisible
    },
    landingPageVisible: state => {
      return state.landingPageVisible
    },
    views: state => {
      return state.views
    },
    ldDetails: state => {
      return state.ldDetails
    },
    mei: state => uri => {
      return state.meiCache[uri]
    },
    initialLoading: state => {
      return state.initialLoading
    },
    verovioCurrentMdivIndex: state => (viewIndex) => {
      const view = state.views[viewIndex]
      if (view === undefined || view.state === undefined || view.state.mdivIndex === undefined) {
        return 0
      }

      return parseInt(view.state.mdivIndex)
    }
  }
}
