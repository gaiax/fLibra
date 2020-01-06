export const state = () => ({
  libraAddress: '',
  mnemonic: '',
  etherAddress: '',
  pk: '',
  libraBalance: ''
})

export const mutations = {
  setlibraAddress(state, libraAddress) {
    state.libraAddress = libraAddress
  },
  setmnemonic(state, mnemonic) {
    state.mnemonic = mnemonic
  },
  setetherAddress(state, etherAddress) {
    state.etherAddress = etherAddress
  },
  setetherPk(state, pk) {
    state.pk = pk
  }
}

export const actions = {}
