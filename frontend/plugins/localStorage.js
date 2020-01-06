import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  window.onNuxtReady(() => {
    createPersistedState({
      paths: [
        'user.libraAddress',
        'user.mnemonic',
        'user.etherAddress',
        'user.pk'
      ]
    })(store)
  })
}
