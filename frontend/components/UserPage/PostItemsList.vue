<template>
  <div class="my-item-list">
    <el-tabs v-model="activeName" :stretch="Boolean(true)">
      <el-tab-pane label="On sale" name="first">
        <div
          class="item-list"
          v-for="(item, index) in onSaleItems"
          :key="index"
        >
          <el-card class="item-card" :body-style="{ padding: '0px' }">
            <ItemCard :item="item" />
          </el-card>
        </div>
      </el-tab-pane>
      <el-tab-pane label="In progress" name="second">
        <div
          class="item-list"
          v-for="(item, index) in inProgressItems"
          :key="index"
        >
          <el-card class="item-card" :body-style="{ padding: '0px' }">
            <ItemCard :item="item" />
            <div v-if="item.preparedForDelivery === Boolean(false)">
              <p
                class="item-status"
                style="width: 135px; background-color: rgb(255, 94, 36);"
              >
                Waiting for delivery
              </p>
              <div style="text-align: center;">
                <el-button
                  class="button--grey"
                  v-loading="loading"
                  @click="visiblePreparedForDelivereyDialog(item)"
                  >Chnage status</el-button
                >
              </div>
            </div>
            <div v-else-if="item.delivered === Boolean(false)">
              <p
                class="item-status"
                style="width: 85px; background-color: rgb(255, 110, 57);"
              >
                On delivery
              </p>
              <div style="height: 40px;"></div>
            </div>
            <div v-else-if="item.purchaserReview === Boolean(false)">
              <p
                class="item-status"
                style="width: 72px; background-color: orange;"
              >
                Delivered
              </p>
              <div style="text-align: center;">
                <el-button
                  class="button--grey"
                  @click="visibleReview2Purchaser(item.itemId)"
                  >Write review</el-button
                >
              </div>
            </div>
          </el-card>
          <el-dialog
            :visible.sync="visiblePreparedForDeliverey"
            title="Did you prepare for delivery？"
            style="margin; 0 auto; text-align: center;"
          >
            <el-form ref="preparedForDelivery" :model="item">
              <el-button
                class="button--grey"
                @click="preparedForDelivery()"
                v-loading="loading"
                >Yes</el-button
              >
            </el-form>
          </el-dialog>
          <el-dialog
            :visible.sync="visibleReviewToPurchaser"
            title="Write Review"
          >
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
                  placeholder="Please describe about the purchaser"
                  v-model="form.text"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  class="button--grey"
                  style="float: right;"
                  v-loading="loading"
                  @click="writeReviewToPurchaser()"
                  >Post review</el-button
                >
              </el-form-item>
            </el-form>
          </el-dialog>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Completed" name="third">
        <div
          class="item-list"
          v-for="(item, index) in completedItems"
          :key="index"
        >
          <nuxt-link
            :to="'/itemDetail/' + item.itemId"
            style="text-decoration: none;"
            no-prefetch
          >
            <el-card class="item-card" :body-style="{ padding: '0px' }">
              <ItemCard :item="item" />
            </el-card>
          </nuxt-link>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import firestore from '~/plugins/firestore'
import ItemCard from './ItemCard'

export default {
  components: {
    ItemCard
  },
  data: function() {
    return {
      activeName: 'first',
      visiblePreparedForDeliverey: false,
      visibleReviewToPurchaser: false,
      myPostedItems: [],
      onSaleItems: [],
      inProgressItems: [],
      completedItems: [],
      loading: false,
      form: {
        star: 0,
        text: ''
      }
    }
  },
  methods: {
    visiblePreparedForDelivereyDialog(item) {
      this.visiblePreparedForDeliverey = true
      this.item = item
    },
    visibleReview2Purchaser(itemId) {
      this.visibleReviewToPurchaser = true
      this.itemId = itemId
    },
    async preparedForDelivery() {
      this.loading = true
      let itemRef = firestore.collection('items')

      await itemRef.doc(String(this.item.itemId)).update({
        preparedForDelivery: true
      })
      await this.$message({
        showClose: true,
        message: 'Notified the purchaser of you prepared for delivery.',
        type: 'success'
      })
      this.loading = false
      this.visiblePreparedForDeliverey = false
    },
    async writeReviewToPurchaser() {
      this.loading = true
      const address = await this.$store.state.user.etherAddress
      const pk = await this.$store.state.user.pk
      const libraAddress = this.$store.state.user.libraAddress

      await this.$web3.eth.accounts.wallet.add({
        privateKey: pk,
        address: address
      })
      this.$web3.eth.defaultAccount = await address

      const gasPrice = await this.$web3.eth.getGasPrice()
      const gasEstimate = await this.$flibraContract.methods
        .writeReviewToPurchaser(
          this.itemId,
          this.form.star,
          this.form.text,
          libraAddress
        )
        .estimateGas({ from: this.$web3.eth.defaultAccount })
      let itemRef = firestore.collection('items')
      let purchaserReviewRef = firestore.collection('purchaserReview')

      const functionAbi = await this.$flibraContract.methods
        .writeReviewToPurchaser(
          this.itemId,
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
            .doc(receipt.events.WriteReviewToPurchaser.returnValues.itemId)
            .update({
              purchaserReview: true
            })
          await purchaserReviewRef
            .doc(receipt.events.WriteReviewToPurchaser.returnValues.itemId)
            .update({
              star: Number(
                receipt.events.WriteReviewToPurchaser.returnValues.star
              ),
              text: receipt.events.WriteReviewToPurchaser.returnValues.text
            })
        })
        .on('error', console.error)
      await this.$message({
        showClose: true,
        message: 'Successfully posted your review',
        type: 'success'
      })
      this.loading = false
      this.form = {}
      this.visibleReviewToPurchaser = false
    }
  },
  async created() {
    setTimeout(async () => {
      const libraAddress = await this.$store.state.user.libraAddress
      const itemRef = await firestore
        .collection('items')
        .where('seller', '==', libraAddress)
        .orderBy('itemId', 'desc')
        .limit(20)

      itemRef.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            if (change.doc.data().selling === Boolean(true)) {
              this.onSaleItems.push(change.doc.data())
            } else if (change.doc.data().purchaserReview === Boolean(true)) {
              this.completedItems.push(change.doc.data())
            } else {
              this.inProgressItems.push(change.doc.data())
            }
          }
          if (change.type === 'modified') {
            if (change.doc.data().selling === Boolean(true)) {
            } else if (change.doc.data().purchaserReview === Boolean(true)) {
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
              const arrayofOnSaleItems = this.onSaleItems

              if (change.doc.data().preparedForDelivery == false) {
                arrayofInProgressItems.push(change.doc.data())
                arrayofInProgressItems.sort((a, b) => b.itemId - a.itemId)
                arrayofOnSaleItems.some(function(v, i) {
                  if (v.itemId == change.doc.data().itemId) {
                    arrayofOnSaleItems.splice(i, 1)
                  }
                })
              } else {
                arrayofInProgressItems.some(function(v, i) {
                  if (v.itemId == change.doc.data().itemId) {
                    arrayofInProgressItems[i] = change.doc.data()
                    arrayofInProgressItems.splice(i, 1)
                    arrayofInProgressItems.push(change.doc.data())
                    arrayofInProgressItems.sort((a, b) => b.itemId - a.itemId)
                  }
                })
              }
              this.inProgressItems = arrayofInProgressItems
              this.onSaleItems = arrayofOnSaleItems
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
  height: 40px;
  width: 155px;
  font-size: 13px;
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
