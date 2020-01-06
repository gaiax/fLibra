<template>
  <div class="wrapper">
    <div class="item-position">
      <p>{{ item.categoryName }} > {{ item.itemName }}</p>
    </div>
    <div class="image-field">
      <img class="item-image" :src="'https://ipfs.io/ipfs/' + item.itemPhoto" />
    </div>
    <div class="item-detail-field">
      <p class="item-name">{{ item.itemName }}</p>
      <img src="~/assets/img/libra-coin.png" class="libra-coin" /><span
        class="item-price"
        >{{ item.price }}</span
      >
      <p
        v-if="item.seller == $store.state.user.libraAddress"
        style="margin-top: 10px;"
      >
        Purchaser：
        <nuxt-link :to="'/user/' + item.purchaser" no-prefetch>{{
          purchaser
        }}</nuxt-link>
      </p>
      <p v-else style="margin-top: 10px;">
        Seller：
        <nuxt-link :to="'/user/' + item.seller" no-prefetch>{{
          item.sellerName
        }}</nuxt-link>
      </p>
      <p style="margin-top: 10px;">Detail</p>
      <div class="text-area">
        {{ item.itemDetailText }}
      </div>
      <p style="margin-top: 10px;">Category：{{ item.categoryName }}</p>
      <p style="margin-top: 10px;">
        Item condition：{{ item.itemConditionName }}
      </p>
      <div v-if="item.seller == $store.state.user.libraAddress">
        <div v-if="item.selling === Boolean(true)">
          <el-button
            v-loading="loading"
            class="button--grey"
            @click="showEditPage(item)"
            >Edit
          </el-button>
          <el-button
            v-loading="loading"
            class="button--grey"
            @click="visibleDeletePage = true"
            >Delete
          </el-button>
        </div>
        <div v-else>
          <el-button type="info" style="float: right;" disabled
            >Sold out</el-button
          >
        </div>
      </div>
      <div v-else>
        <el-button
          v-if="item.selling === Boolean(true)"
          v-loading="loading"
          class="button--grey"
          style="float: right;"
          @click="beforePurchase"
          >Buy now
        </el-button>
        <el-button v-else type="info" style="float: right;" disabled
          >Sold out</el-button
        >
      </div>
    </div>
    <el-dialog :visible.sync="visibleSignIn" style="text-align: center;">
      <p>Please sign in</p>
      <nuxt-link :to="{ path: subLink }" no-prefetch>
        <el-button class="button--grey-link">Go to sign in</el-button>
      </nuxt-link>
    </el-dialog>
    <el-dialog :visible.sync="visibleMypage" style="text-align: center;">
      <p>Please register your user information before selling your item</p>
      <nuxt-link :to="{ path: subLink }" no-prefetch>
        <el-button class="button--grey-link">Go to my page</el-button>
      </nuxt-link>
    </el-dialog>
    <el-dialog
      :visible.sync="visibleLibraStatus"
      style="text-align: center;"
      title="Transaction failed"
    >
      <p>
        Libra blockchain is frequently developing,<br />
        and we cannot interact with Libra in this time.<br />
        We are looking at what is going on Libra and will fix the problem.<br />
        Please try again later.<br />
        Thank you!
      </p>
    </el-dialog>
    <el-dialog :visible.sync="visibleEditPage" title="Register your user info">
      <el-form
        ref="form"
        :model="form"
        label-width="120px"
        style="padding-top: 30px;"
      >
        <el-form-item label="Item Name">
          <el-input
            type="text"
            placeholder="Please type your item name"
            v-model="form.itemName"
          ></el-input>
        </el-form-item>
        <el-form-item label="Photo">
          <input type="file" placeholder="Please input" @change="captureFile" />
        </el-form-item>
        <el-form-item label="Price">
          <el-input
            type="number"
            placeholder="Please set your item price"
            v-model="form.price"
          ></el-input>
        </el-form-item>
        <el-form-item label="Detail">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 15 }"
            placeholder="Please describe your item detail"
            v-model="form.itemDetailText"
          ></el-input>
        </el-form-item>
        <el-form-item label="Category">
          <el-select v-model="form.category" placeholder="Category">
            <el-option
              v-for="item in categoryList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Item condition">
          <el-select v-model="form.itemCondition" placeholder="Item condition">
            <el-option
              v-for="item in itemConditionList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            class="button--grey"
            style="float: right"
            v-loading="loading"
            @click="edit()"
            >Edit</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog
      :visible.sync="visibleDeletePage"
      title="Do you delete this item?"
      style="text-align: center;"
    >
      <el-button class="button--grey" @click="deleteItem()">Yes </el-button>
    </el-dialog>
  </div>
</template>

<script>
import firestore from '~/plugins/firestore'
import { LibraWallet, LibraClient, LibraNetwork } from 'kulap-libra'
const BigNumber = require('bignumber.js')
import itemOption from '~/assets/itemOption.json'
import ItemDetail from '~/abis/ItemDetail.json'

export default {
  data: function() {
    return {
      libraBalance: '',
      libraStatus: false,
      loading: false,
      purchaser: '',
      subLink: '',
      visibleLibraStatus: false,
      visibleSignIn: false,
      visibleMypage: false,
      visibleEditPage: false,
      visibleDeletePage: false,
      item: {},
      categoryList: itemOption.categoryList,
      itemConditionList: itemOption.itemConditionList,
      form: {
        itemName: '',
        price: '',
        buffer: '',
        itemDetailText: '',
        category: '',
        itemCondition: ''
      },
      ref_item: firestore.collection('items'),
      sellerReviewRef: firestore.collection('sellerReview'),
      purchaserReviewRef: firestore.collection('purchaserReview')
    }
  },
  methods: {
    async beforePurchase() {
      if (this.subLink != '') {
        if (this.subLink == '/signin') {
          this.visibleSignIn = true
        } else {
          this.visibleMypage = true
        }
      } else {
        this.loading = true
        if (this.libraStatus == false) {
          return setTimeout(() => {
            this.loading = false
            this.visibleLibraStatus = true
          }, 3000)
        } else if (this.libraBalance < this.item.price) {
          this.loading = false
          return this.$alert('You do not have enough Libra coin', 'Alert', {
            confirmButtonText: 'OK'
          })
        } else {
          return this.purchase()
        }
      }
    },
    async purchase() {
      let itemId = this.item.itemId
      let flibraEscrowAddress =
        'cbab555b0f1b1ae48e82926b9bd3bc4f0785611c8bdd6a71db9fd37a48ad179e'
      let amount = this.item.price
      let sellerLibraAddress = this.item.seller
      let ref_item = this.ref_item
      let ref_review = this.ref_review
      let sellerReviewRef = this.sellerReviewRef
      let purchaserReviewRef = this.purchaserReviewRef

      const libraAddress = await this.$store.state.user.libraAddress
      const address = await this.$store.state.user.etherAddress
      const pk = await this.$store.state.user.pk
      const mnemonic = await this.$store.state.user.mnemonic
      const app = this

      // walletの作成 & コントラクトへの書き込み
      await this.$web3.eth.accounts.wallet.add({
        privateKey: pk,
        address: address
      })
      this.$web3.eth.defaultAccount = await address

      const gasPrice = await this.$web3.eth.getGasPrice()
      const gasEstimate = await this.$flibraContract.methods
        .purchaseItem(itemId, libraAddress)
        .estimateGas({ from: this.$web3.eth.defaultAccount })

      const sellerUserInfo = await this.$flibraContract.methods
        .getUserInfo(sellerLibraAddress)
        .call()
      const purchaserUserInfo = await this.$flibraContract.methods
        .getUserInfo(libraAddress)
        .call()

      // transfer libra coin
      const client = await new LibraClient({
        transferProtocol: 'https',
        host: 'ac-libra-testnet.kulap.io',
        port: '443',
        dataProtocol: 'grpc-web-text'
      })
      const wallet = await new LibraWallet({
        mnemonic: mnemonic
      })
      const account = await wallet.newAccount()
      const amountToTransfer = BigNumber(amount).times(1e6)

      // Stamp account state before transfering
      const beforeAccountState = await client.getAccountState(
        account.getAddress()
      )
      // Transfer
      const response = client.transferCoins(
        account,
        flibraEscrowAddress,
        amountToTransfer
      )

      const functionAbi = await this.$flibraContract.methods
        .purchaseItem(itemId, libraAddress)
        .send({
          from: this.$web3.eth.defaultAccount,
          gas: gasEstimate,
          gasPrice: gasPrice
        })
        .on('receipt', async function(receipt) {
          console.log(receipt)

          // firabaseの書き換え
          await ref_item
            .doc(receipt.events.ItemPurchased.returnValues.id)
            .update({
              purchaser: receipt.events.ItemPurchased.returnValues.purchaser,
              selling: false,
              preparedForDelivery: false,
              delivered: false,
              sellerReview: false,
              purchaserReview: false,
              ES_STATE: 'Item sold'
            })

          // Reviewを作成する
          await sellerReviewRef
            .doc(receipt.events.ItemPurchased.returnValues.id)
            .set({
              star: 0,
              text: '',
              seller: sellerLibraAddress,
              purchaser: receipt.events.ItemPurchased.returnValues.purchaser,
              purchaserUserName: purchaserUserInfo.userName
            })
          await purchaserReviewRef
            .doc(receipt.events.ItemPurchased.returnValues.id)
            .set({
              star: 0,
              text: '',
              seller: sellerLibraAddress,
              sellerUserName: sellerUserInfo.userName,
              purchaser: receipt.events.ItemPurchased.returnValues.purchaser
            })

          await app.$message({
            showClose: true,
            message: 'Successfully purchased the item',
            type: 'success'
          })
          app.loading = await false
          await app.$router.push('/')
        })
        .on('error', console.error)
    },
    showEditPage(item) {
      this.visibleEditPage = true
      this.itemId = item.itemId
      this.itemContractAddress = item.itemDetailContract
      this.form.itemName = item.itemName
      this.form.price = item.price
      this.form.buffer = item.itemPhoto
      this.form.itemDetailText = item.itemDetailText
      this.form.category = item.category
      this.form.itemCondition = item.itemCondition
    },
    async captureFile(e) {
      event.preventDefault()
      const file = await event.target.files[0]
      const reader = await new window.FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => {
        this.form.buffer = Buffer(reader.result)
        console.log('buffer', this.form.buffer)
      }
    },
    async edit() {
      this.loading = true
      const address = await this.$store.state.user.etherAddress
      const pk = await this.$store.state.user.pk

      // // walletの作成 & コントラクトへの書き込み
      await this.$web3.eth.accounts.wallet.add({
        privateKey: pk,
        address: address
      })
      this.$web3.eth.defaultAccount = await address

      let itemContract = await new this.$web3.eth.Contract(
        ItemDetail.abi,
        this.itemContractAddress
      )

      const gasPrice = await this.$web3.eth.getGasPrice()
      const gasEstimate = await itemContract.methods
        .editItem(
          this.form.itemName,
          this.form.buffer,
          this.form.price,
          this.form.itemDetailText,
          this.form.category,
          this.form.itemCondition
        )
        .estimateGas({ from: this.$web3.eth.defaultAccount })
      const itemId = this.itemId
      const ref_item = this.ref_item

      await itemContract.methods
        .editItem(
          this.form.itemName,
          this.form.buffer,
          this.form.price,
          this.form.itemDetailText,
          this.form.category,
          this.form.itemCondition
        )
        .send({
          from: this.$web3.eth.defaultAccount,
          gas: gasEstimate,
          gasPrice: gasPrice
        })
        .on('receipt', async function(receipt) {
          console.log(receipt)
          await ref_item.doc(String(itemId)).update({
            itemName: receipt.events.EditItem.returnValues._itemName,
            price: Number(receipt.events.EditItem.returnValues._price),
            itemPhoto: receipt.events.EditItem.returnValues._itemPhoto,
            itemDetailText:
              receipt.events.EditItem.returnValues._itemDetailText,
            category: Number(receipt.events.EditItem.returnValues._category),
            itemCondition: Number(
              receipt.events.EditItem.returnValues._itemCondition
            ),
            ES_STATE: 'Not yet'
          })
        })
      this.form = {}
      this.loading = false
      this.visibleEditPage = false
    },
    async deleteItem() {
      const address = await this.$store.state.user.etherAddress
      const pk = await this.$store.state.user.pk

      // // walletの作成 & コントラクトへの書き込み
      await this.$web3.eth.accounts.wallet.add({
        privateKey: pk,
        address: address
      })
      this.$web3.eth.defaultAccount = await address
      let itemContract = await new this.$web3.eth.Contract(
        ItemDetail.abi,
        this.item.itemDetailContract
      )

      const gasPrice = await this.$web3.eth.getGasPrice()
      const gasEstimate = await itemContract.methods
        .deleteItem()
        .estimateGas({ from: this.$web3.eth.defaultAccount })
      let itemId = this.item.itemId
      const ref_item = this.ref_item

      await itemContract.methods
        .deleteItem()
        .send({
          from: this.$web3.eth.defaultAccount,
          gas: gasEstimate,
          gasPrice: gasPrice
        })
        .on('receipt', async function(receipt) {
          console.log(receipt)
          await ref_item.doc(String(itemId)).update({
            ES_STATE: 'Item sold'
          })
          await ref_item.doc(String(itemId)).delete()
        })
    }
  },
  async created() {
    let itemId = await this.$nuxt.$route.params.id
    let item = await this.ref_item.doc(itemId).onSnapshot(async snap => {
      if (snap.data() == undefined) {
        return
      } else {
        await setTimeout(async () => {
          let itemData = await snap.data()
          let category = itemData.category
          itemData.categoryName =
            itemOption.categoryList[itemData.category - 1].label
          itemData.itemConditionName =
            itemOption.itemConditionList[itemData.itemCondition - 1].label

          const userLibraAddress = this.$store.state.user.libraAddress
          const userInfo = await this.$flibraContract.methods
            .getUserInfo(userLibraAddress)
            .call()

          if (itemData.seller == userLibraAddress) {
            const purchaserInfo = await this.$flibraContract.methods
              .getUserInfo(itemData.purchaser)
              .call()
            this.purchaser = purchaserInfo.userName
          } else {
            const sellerInfo = await this.$flibraContract.methods
              .getUserInfo(itemData.seller)
              .call()
            itemData.sellerName = await sellerInfo.userName
            if (userLibraAddress == '') {
              this.subLink = '/signin'
            } else if (userInfo.userAddress == '') {
              this.subLink = '/myPage'
            } else {
            }
          }
          this.item = itemData
          const client = new LibraClient({
            transferProtocol: 'https',
            host: 'ac-libra-testnet.kulap.io',
            port: '443',
            dataProtocol: 'grpc-web-text'
          })
          const accountState = await client.getAccountState(userLibraAddress)
          let balance = accountState.balance / 1000000
          this.libraBalance = balance
          this.libraStatus = true
        }, 1)
      }
    })
  }
}
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-wrap: wrap;
}

.item-name {
  font-weight: bold;
  font-size: 30px;
  margin-bottom: 10px;
}

.libra-coin {
  width: 20px;
  height: 20px;
  vertical-align: baseline;
}

.item-price {
  font-size: 25px;
  font-weight: 500;
  padding-left: 10px;
}

.item-position {
  padding-top: 20px;
  width: 100%;
}

.image-field {
  padding-top: 20px;
  width: 40%;
}

.item-image {
  width: 100%;
}

.item-detail-field {
  width: 55%;
  padding-top: 20px;
  padding-left: 20px;
  margin-left: 10px;
}

.text-area {
  padding: 10px;
  border-radius: 10px;
  color: #767779;
  border: 1px solid #e4e7ed;
  background: #f5f7fb;
}

.button--grey {
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  background-color: #f1f1f1;
  text-decoration: none;
  height: 40px;
  width: 110px;
  font-size: 14px;
  margin: 5px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}

.button--grey-link {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  margin-top: 3%;
}

.button--grey-link:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
