import { createStore } from 'vuex'

import { appModule } from '@/store/modules/appModule.js'
import { userModule } from '@/store/modules/userModule.js'
import { graphModule } from '@/store/modules/graphModule.js'
import { solidModule } from '@/store/modules/solidModule.js'

export default createStore({
  modules: {
    app: appModule,
    user: userModule,
    graph: graphModule,
    solid: solidModule
  },
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  }
})
