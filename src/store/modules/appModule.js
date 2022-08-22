export const appModule = {
  state: () => ({
    selectionTool: {
      visible: false
    },
    overviewTool: {
      visible: false
    },
    annotationTool: {
      visible: false
    },
    libraryModalVisible: false,
    landingPageVisible: true
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
    }
  }
}
