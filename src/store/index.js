import { createStore } from 'vuex'
import { appModule } from '@/store/modules/appModule.js'
import { userModule } from '@/store/modules/userModule.js'
import { graphModule } from '@/store/modules/graphModule.js'

export default createStore({
  modules: {
    app: appModule,
    user: userModule,
    graph: graphModule
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
