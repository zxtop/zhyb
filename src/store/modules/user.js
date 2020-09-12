export default {
  namespaced: true,
  state: {
    id: 0,
    name: '',
    hospitalId: 0
  },
  mutations: {
    updateId (state, id) {
      state.id = id
    },
    updateName (state, name) {
      state.name = name
    },
    updateHospital (state, id) {
      state.hospitalId = id
    }
  }
}
