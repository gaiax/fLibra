<template>
  <div class="my-item-list">
    <el-tabs v-model="activeName" :stretch="Boolean(true)">
      <el-tab-pane label="In progress" name="first">
        <div class="item-list" v-for="(item, index) in inProgressItems">
          <el-card class="item-card" :body-style="{ padding: '0px' }">
            <ItemCard :item="item" />
            <div v-if="item.preparedForDelivery === Boolean(false)">
              <p
                class="item-status"
                style="width: 135px; background-color: rgb(255, 94, 36);"
              >
                Waiting for delivery
              </p>
              <div style="height: 40px;"></div>
            </div>
            <div v-else-if="item.delivered === Boolean(false)">
              <p
                class="item-status"
                style="width: 85px; background-color: rgb(255, 110, 57);"
              >
                On delivery
              </p>
              <div style="text-align: center;">
                <el-button
                  class="button--grey"
                  @click="visibleDeliveredDialog(item)"
                  >Chnage status</el-button
                >
              </div>
            </div>
            <div v-else-if="item.sellerReview === Boolean(false)">
              <p
                class="item-status"
                style="width: 72px; background-color: orange;"
              >
                Delivered
              </p>
              <div style="text-align: center;">
                <el-button
                  class="button--grey"
                  @click="visibleReview2Seller(item)"
                  >Write Review</el-button
                >
              </div>
            </div>
          </el-card>
          <el-dialog
            :visible.sync="visibleDelivered"
            style="text-align: center;"
            title="Did you receive the item？"
          >
            <el-form ref="delivered" :model="item">
              <el-button
                class="button--grey"
                @click="itemDelivered()"
                v-loading="loading"
                >Yes</el-button
              >
            </el-form>
          </el-dialog>
          <el-dialog :visible.sync="visibleReviewToSeller" title="Write Review">
            <el-form
              ref="form"
              :model="form"
              label-width="120px"
              style="width: 90%"
            >
              <el-form-item label="Rate" required>
                <el-rate v-model="form.star"></el-rate>
              </el-form-item>
              <el-form-item label="Review" required>
                <el-input
                  type="text"
                  placeholder="Please describe about the seller "
                  v-model="form.text"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  class="button--grey"
                  plain
                  style="float: right;"
                  v-loading="loading"
                  @click="writeReviewToSeller()"
                  >Post Review</el-button
                >
              </el-form-item>
            </el-form>
          </el-dialog>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Completed" name="second">
        <div
          class="item-list"
          v-for="(item, index) in completedItems"
          :key="index"
        >
          <el-card class="item-card" :body-style="{ padding: '0px' }">
            <ItemCard :item="item" />
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import firestore from '~/plugins/firestore'
import { LibraWallet, LibraClient, LibraNetwork } from 'kulap-libra'
const BigNumber = require('bignumber.js')
import ItemCard from './ItemCard'

export default {
  components: {
    ItemCard
  },
  data: function() {
    return {
      activeName: 'first',
      visibleReviewToSeller: false,
      visibleDelivered: false,
      myPurchaedItems: [],
      inProgressItems: [],
      completedItems: [],
      item: {},
      loading: false,
      form: {
        star: 0,
        text: ''
      },
      delivered: ''
    }
  },
  methods: {
    visibleDeliveredDialog(item) {
      this.visibleDelivered = true
      this.item = item
    },
    visibleReview2Seller(item) {
      this.visibleReviewToSeller = true
      this.item = item
    },
    async itemDelivered() {
      this.loading = true
      const libraAddress = this.$store.state.user.libraAddress
      const pk = await this.$store.state.user.pk
      const address = await this.$store.state.user.etherAddress
      await this.$web3.eth.accounts.wallet.add({
        privateKey: pk,
        address: address
      })
      this.$web3.eth.defaultAccount = await address

      const gasPrice = await this.$web3.eth.getGasPrice()
      const gasEstimate = await this.$flibraContract.methods
        .itemDelivered(this.item.itemId, libraAddress)
        .estimateGas({ from: this.$web3.eth.defaultAccount })
      let itemRef = firestore.collection('items')

      let item = this.item
      const functionAbi = await this.$flibraContract.methods
        .itemDelivered(this.item.itemId, libraAddress)
        .send({
          from: this.$web3.eth.defaultAccount,
          gas: gasEstimate,
          gasPrice: gasPrice
        })
        .on('receipt', async function(receipt) {
          // firabaseの書き換え
          await itemRef
            .doc(receipt.events.ItemDelivered.returnValues.id)
            .update({
              delivered: receipt.events.ItemDelivered.returnValues.delivered
            })

          // escrow accout から Libraの送金
          const client = new LibraClient({
            transferProtocol: 'https',
            host: 'ac-libra-testnet.kulap.io',
            port: '443',
            dataProtocol: 'grpc-web-text'
          })
          const wallet = new LibraWallet({
            mnemonic: process.env.escrowLibraMnemonic
          })
          const account = wallet.newAccount()
          const amountToTransfer = BigNumber(item.price).times(1e6)

          // Stamp account state before transfering
          const beforeAccountState = await client.getAccountState(
            account.getAddress()
          )

          // Transfer
          const response = await client.transferCoins(
            account,
            item.seller,
            amountToTransfer
          )
        })
        .on('error', console.error)
      await this.$message({
        showClose: true,
        message: 'Notified the seller of you received the item.',
        type: 'success'
      })
      this.loading = false
      this.visibleDelivered = await false
    },
    async writeReviewToSeller() {
      this.loading = true
      const libraAddress = this.$store.state.user.libraAddress
      const pk = await this.$store.state.user.pk
      const address = await this.$store.state.user.etherAddress
      await this.$web3.eth.accounts.wallet.add({
        privateKey: pk,
        address: address
      })
      this.$web3.eth.defaultAccount = await address

      const gasPrice = await this.$web3.eth.getGasPrice()
      const gasEstimate = await this.$flibraContract.methods
        .writeReviewToSeller(
          this.item.itemId,
          this.form.star,
          this.form.text,
          libraAddress
        )
        .estimateGas({ from: this.$web3.eth.defaultAccount })
      let itemRef = firestore.collection('items')
      let sellerReviewRef = firestore.collection('sellerReview')

      const functionAbi = await this.$flibraContract.methods
        .writeReviewToSeller(
          this.item.itemId,
          this.form.star,
          this.form.text,
          libraAddress
        )
        .send({
          from: this.$web3.eth.defaultAccount,
          gas: gasEstimate,
          gasPrice: gasPrice
        })
        .on('receipt', async function(receipt) {
          await itemRef
            .doc(receipt.events.WriteReviewToSeller.returnValues.itemId)
            .update({
              sellerReview: true
            })
          await sellerReviewRef
            .doc(receipt.events.WriteReviewToSeller.returnValues.itemId)
            .update({
              star: Number(
                receipt.events.WriteReviewToSeller.returnValues.star
              ),
              text: receipt.events.WriteReviewToSeller.returnValues.text
            })
        })
        .on('error', console.error)
      await this.$message({
        showClose: true,
        message: 'Successfully pusted the review.',
        type: 'success'
      })
      this.loading = false
      this.form = {}
      this.visibleReviewToSeller = false
    }
  },
  async created() {
    setTimeout(async () => {
      const libraAddress = await this.$store.state.user.libraAddress
      const itemRef = firestore
        .collection('items')
        .where('purchaser', '==', libraAddress)
        .orderBy('itemId', 'desc')
        .limit(20)

      itemRef.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            if (change.doc.data().sellerReview === Boolean(true)) {
              this.completedItems.push(change.doc.data())
            } else {
              this.inProgressItems.push(change.doc.data())
            }
          }
          if (change.type === 'modified') {
            if (change.doc.data().sellerReview === Boolean(true)) {
              const arrayofInProgressItems = this.inProgressItems
              arrayofInProgressItems.some(function(v, i) {
                if (v.itemId == change.doc.data().itemId) {
                  arrayofInProgressItems.splice(i, 1)
                }
              })
              this.inProgressItems = arrayofInProgressItems
              this.completedItems.push(change.doc.data())
            } else {
              const arrayofInProgressItems = this.inProgressItems
              arrayofInProgressItems.some(function(v, i) {
                if (v.itemId == change.doc.data().itemId) {
                  arrayofInProgressItems[i] = change.doc.data()
                  arrayofInProgressItems.splice(i, 1)
                  arrayofInProgressItems.push(change.doc.data())
                  arrayofInProgressItems.sort((a, b) => b.itemId - a.itemId)
                }
              })
              this.inProgressItems = arrayofInProgressItems
            }
          }
        })
      })
    }, 1)
  }
}
</script>

<style scoped>
.title-text {
  clear: both;
  text-align: center;
}

.item-card {
  width: 100%;
  padding-bottom: 14px;
  white-space: nowrap;
  overflow-x: scroll;
}

.item-card:hover {
  border: 1.2px solid #35495e;
}

.my-item-list {
  padding-top: 10px;
  overflow: hidden;
  min-height: 440px;
}

.item-list {
  width: 32%;
  float: left;
  margin: 3px;
}

.item-image {
  height: 200px;
}

.item-status {
  border-radius: 5px;
  height: 20px;
  margin: 15px 0px 15px 20px;
  color: white;
  font-size: 13px;
  padding: 2px 0px 0px 7px;
}

.button--grey {
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  height: 40px;
  width: 155px;
  font-size: 12px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}

.review-list {
  float: left;
  width: 45%;
  margin-left: 5px;
  border: 1px solid black;
}
</style>
