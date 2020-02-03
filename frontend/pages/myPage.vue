<template>
  <div style="padding: 30px;">
    <div class="wrapper">
      <div class="image-field">
        <img
          class="user-image"
          v-if="user.userIcon == ''"
          src="~assets/img/flibra.svg"
        />
        <img v-else class="user-image" :src="user.userIcon" />
      </div>
      <div class="user-info">
        <div v-if="user.userName != ''" style="margin: 10px 0px">
          <span
            style="font-size: 25px; font-weight: bold; vertical-align: sub;"
          >
            {{ user.userName }}
          </span>
          <el-button
            type="plain"
            class="el-icon-edit"
            @click="visibleCreateUser = true"
            circle
          ></el-button>
        </div>
        <img src="~/assets/img/libra-coin.png" class="libra-coin" />
        <span class="libra-balance"> {{ libraBalance }}</span>
        <a
          :href="
            'https://libexplorer.com/address/' + $store.state.user.libraAddress
          "
          style="font-size: 3px;"
          >>> See transaction history</a
        >
        <div class="address-field">
          <img
            src="~/assets/img/libra-address-icon.png"
            class="address-icon"
          /><span style="font-size: 11px; padding-left: 3px;">{{
            $store.state.user.libraAddress
          }}</span>
        </div>
        <div class="address-field">
          <img
            src="~/assets/img/ether-address-icon.png"
            class="address-icon"
          /><span style="font-size: 11px; padding-left: 3px;">{{
            $store.state.user.etherAddress
          }}</span>
        </div>
        <div v-if="user.userName == ''">
          <el-button
            class="button--grey-small"
            @click="visibleCreateUser = true"
            >Register your user info</el-button
          >
        </div>
        <el-dialog
          :visible.sync="visibleCreateUser"
          title="Register your user info"
        >
          <el-form label-width="120px" style="width: 90%">
            <el-form-item label="UserIcon" required>
              <input
                type="file"
                placeholder="Please input"
                @change="captureFile"
              />
            </el-form-item>
            <el-form-item label="User Name" required>
              <el-input
                type="text"
                placeholder="Please type user name"
                v-model="form.userName"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                class="button--grey"
                style="float: right"
                v-loading="loading"
                @click="createUserInfo()"
                >Register</el-button
              >
            </el-form-item>
          </el-form>
        </el-dialog>
      </div>
    </div>
    <hr />
    <h2>Posted Items</h2>
    <PostItemsList />
    <hr />
    <h2>Purchased Items</h2>
    <PurchaseItemsList />
    <hr />
    <h2>Review</h2>
    <Review />
    <ItemPostButton :link="link" :subLink="subLink" />
  </div>
</template>

<script>
import PostItemsList from '@/components/UserPage/PostItemsList'
import PurchaseItemsList from '@/components/UserPage/PurchaseItemsList'
import Review from '@/components/Review'
import ItemPostButton from '@/components/ItemPostButton'
import { LibraClient, LibraNetwork } from 'kulap-libra'
import firestore from '~/plugins/firestore'

export default {
  components: {
    PostItemsList,
    PurchaseItemsList,
    Review,
    ItemPostButton,
    link: '/',
    subLink: '/'
  },
  data: function() {
    return {
      user: {},
      visibleCreateUser: false,
      loading: false,
      form: {
        userName: '',
        buffer: ''
      },
      libraAddress: '',
      libraBalance: ''
    }
  },
  methods: {
    async captureFile(e) {
      event.preventDefault()
      const file = await event.target.files[0]
      const reader = await new window.FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => {
        this.form.buffer = Buffer(reader.result)
      }
    },
    async createUserInfo() {
      this.loading = true
      const libraAddress = this.$store.state.user.libraAddress
      const pk = await this.$store.state.user.pk
      const address = await this.$store.state.user.etherAddress
      await this.$web3.eth.accounts.wallet.add({
        privateKey: pk,
        address: address
      })
      this.$web3.eth.defaultAccount = await address

      const app = this
      const result = await this.$ipfs.add(this.form.buffer)
      const gasPrice = await this.$web3.eth.getGasPrice()
      const gasEstimate = await this.$flibraContract.methods
        .setUserInfo(this.form.userName, result[0].hash, libraAddress)
        .estimateGas({ from: this.$web3.eth.defaultAccount })

      const functionAbi = await this.$flibraContract.methods
        .setUserInfo(this.form.userName, result[0].hash, libraAddress)
        .send({
          from: this.$web3.eth.defaultAccount,
          gas: gasEstimate,
          gasPrice: gasPrice
        })
        .on('receipt', async function(receipt) {
          app.user = {
            userName: receipt.events.UserInfoCreated.returnValues.userName,
            userIcon:
              'https://ipfs.io/ipfs/' +
              receipt.events.UserInfoCreated.returnValues.userIcon
          }
        })
        .on('error', console.error)

      await this.$message({
        showClose: true,
        message: 'Registered your user info',
        type: 'success'
      })
      this.visibleCreateUser = false
      this.loading = false
    }
  },
  async created() {
    setTimeout(async () => {
      this.libraAddress = await this.$store.state.user.libraAddress

      const userInfo = await this.$flibraContract.methods
        .getUserInfo(this.$store.state.user.libraAddress)
        .call()
      if (userInfo.userAddress == '') {
        this.user = {
          userName: '',
          userIcon: ''
        }
        this.link = ''
        this.subLink = '/myPage'
      } else {
        this.user = {
          userName: userInfo.userName,
          userIcon: 'https://ipfs.io/ipfs/' + userInfo.userIcon
        }
        this.link = '/itemPost'
      }

      const client = new LibraClient({
        transferProtocol: 'https',
        host: 'ac-libra-testnet.kulap.io',
        port: '443',
        dataProtocol: 'grpc-web-text'
      })
      const accountState = await client.getAccountState(this.libraAddress)
      let balance = accountState.balance / 1000000
      this.libraBalance = balance
    }, 1)
  }
}
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-wrap: wrap;
}

.image-field {
  margin: auto 0;
  width: 23%;
}

.user-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.user-info {
  width: 75%;
  padding: 40px 0px;
}

.address-icon {
  height: 15px;
  width: 15px;
  vertical-align: middle;
}

.libra-coin {
  width: 15px;
  height: 15px;
  vertical-align: baseline;
}

.libra-balance {
  font-size: 20px;
}

.address-field {
  padding-top: 5px;
}

.user-info p {
  margin-top: 8px;
}

.el-icon-edit {
  margin-left: 5px;
}

h2 {
  margin: 20px 0;
  overflow: hidden;
  clear: both;
  text-align: center;
}

h3 {
  padding: 0px 0px 7px 5px;
}

.button--grey-small {
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  background-color: #f1f1f1;
  text-decoration: none;
  margin: 10px 5px;
  padding: 8px 20px;
  font-size: 12px;
}

.button--grey-small:hover {
  color: #fff;
  background-color: #35495e;
}

.button--grey {
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  height: 40px;
  width: 120px;
  font-size: 12px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}

.review-list {
  float: left;
  width: 47%;
  margin-bottom: 50px;
}

.review-from {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
