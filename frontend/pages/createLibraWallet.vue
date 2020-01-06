<template>
  <div>
    <div class="sign-area" v-show="librawallet.length == 0">
      <h2>Create Libra Wallet</h2>
      <br />
      <div class="button--grey" type="button" @click="createWallet">
        <p>Create</p>
      </div>
    </div>
    <div class="account-info" v-show="librawallet.length !== 0">
      <h2>Successflly created your account !</h2>
      <br />
      <div class="account-info-detail">
        <p style="color: red;">
          Please remenber your mnemonic phrase(password).<br />
          <span style="color: black;"
            >Do not tell your mnemonic to others.</span
          >
        </p>
        <br />
        <p>
          Your mnemonic is below.
        </p>
        <div class="text-area" :rows="2">
          {{ librawallet.mnemonic }}
        </div>
      </div>
      <br />
      <div class="account-info-signin">
        <p>
          Once you take a note of your mnemonic,<br />
          Please sign in.
        </p>
        <br />
        <div class="button--grey" type="button" @click="visibleSignIn = true">
          <p>Sign in</p>
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="visibleSignIn" style="text-align: center;">
      <p>
        You can't get same mnemonic, once you leave this page.
      </p>
      <p>
        Did you copy the mnemonic phrase?
      </p>
      <br />
      <nuxt-link to="/signin" no-prefetch>
        <el-button class="button--grey-link">Yes</el-button>
      </nuxt-link>
    </el-dialog>
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
      librawallet: [],
      visibleSignIn: false
    }
  },
  computed: {},
  methods: {
    async createWallet() {
      const wallet = new LibraWallet()
      const account = wallet.newAccount()
      const url = `https://api-test.libexplorer.com/api?module=faucet&action=getfaucet&amount=100000000&address=${account
        .getAddress()
        .toHex()}`
      // const url = `http://faucet.testnet.libra.org?amount=${BigNumber(100)
      //   .times(1e6)
      //   .toString(10)}&address=${account.getAddress().toHex()}`
      await fetch(url, {
        method: 'post',
        mode: 'no-cors'
      })

      this.librawallet = {
        address: account.getAddress().toHex(),
        mnemonic: wallet.config.mnemonic
      }
      this.$message({
        showClose: true,
        message: 'Successflly created your Libra account.',
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.text-area {
  padding: 10px;
  border-radius: 10px;
  width: 90%;
  color: #252525;
  border: 2.5px solid #838485;
  background: #e5e6e7;
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

.sign-area {
  margin-top: 30%;
  text-align: center;
  overflow: hidden;
}

.sign-area p {
  padding: 7px;
}

.account-info {
  margin-top: 20%;
  margin-bottom: 30%;
}

.account-info h2 {
  text-align: center;
}

.account-info-detail {
  padding-left: 12%;
}

.account-info-signin {
  text-align: center;
}

.account-info p {
  padding: 7px;
}
</style>
