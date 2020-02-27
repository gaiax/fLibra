<template>
  <div>
    <div class="sign-area">
      <h2>Sign in</h2>
      <br />
      <p>
        Please enter your mnemonic(password).
      </p>
      <p>
        If you don't have libra wallet, please create your libra wallet<br />
        <nuxt-link to="/createLibraWallet" no-prefetch>
          >> create libra wallet
        </nuxt-link>
      </p>
      <div>
        <el-input
          class="text-area"
          type="textarea"
          :autosize="{ minRows: 3 }"
          placeholder="mnemonic"
          v-model="mnemonic"
        >
        </el-input>
      </div>
      <div>
        <nuxt-link
          class="button--grey"
          :to="{ path: '/' }"
          @click.native="login"
          no-prefetch
        >
          <p>Sign in</p>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import getPrivateKeyFromMnemonic from '~/plugins/mnemonic-privatekey-utils.js'
import { LibraWallet } from 'kulap-libra'
const BigNumber = require('bignumber.js')

export default {
  data() {
    return {
      mnemonic: '',
      librawallet: []
    }
  },
  computed: {},
  methods: {
    async login() {
      const wallet = new LibraWallet({
        mnemonic: this.mnemonic
      })
      const account = wallet.generateAccount(0)

      let privateKeyEther = await getPrivateKeyFromMnemonic(this.mnemonic)
      privateKeyEther = (await '0x') + privateKeyEther
      const etherAddress = this.$web3.eth.accounts.privateKeyToAccount(
        privateKeyEther
      ).address
      await this.$store.commit(
        'user/setlibraAddress',
        account.getAddress().toHex()
      )
      await this.$store.commit('user/setmnemonic', this.mnemonic)
      await this.$store.commit('user/setetherAddress', etherAddress)
      await this.$store.commit('user/setetherPk', privateKeyEther)

      this.$message({
        showClose: true,
        message: 'Successflly sign in.',
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.sign-area {
  margin-top: 25%;
  text-align: center;
  overflow: hidden;
}

.text-area {
  width: 60%;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  text-decoration: none;
  padding: 5px 10px;
  margin-top: 8px;
  color: #35495e;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}

.sign-area p {
  padding: 7px;
}
</style>
