<template>
  <div class="review-field">
    <div class="review-list" style="margin-right: 2%;">
      <h3>Review as Seller</h3>
      <div v-for="(review, index) in reviewsAsSeller" :key="index">
        <div v-if="review.text != ''">
          <p class="review-from">
            <nuxt-link :to="'/user/' + review.purchaser" no-prefetch>{{
              review.purchaserUserName
            }}</nuxt-link>
          </p>
          <p>
            <el-rate
              v-model="review.star"
              disabled
              show-score
              text-color="#ff9900"
              :score-template="review.star + 'points'"
            >
            </el-rate>
          </p>
          <p>{{ review.text }}</p>
          <br />
        </div>
      </div>
    </div>
    <div class="review-list" style="padding-left: 2%;">
      <h3>Review as Purchaser</h3>
      <div
        class="purchaser-review"
        v-for="(review, index) in reviewsAsPurchaser"
        :key="index"
      >
        <div v-if="review.text != ''">
          <p class="review-from">
            <nuxt-link :to="'/user/' + review.seller" no-prefetch>{{
              review.sellerUserName
            }}</nuxt-link>
          </p>
          <p>
            <el-rate
              v-model="review.star"
              disabled
              show-score
              text-color="#ff9900"
              :score-template="review.star + 'points'"
            >
            </el-rate>
          </p>
          <p>{{ review.text }}</p>
          <br />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firestore from '~/plugins/firestore'

export default {
  data: function() {
    return {
      reviewsAsSeller: [],
      reviewsAsPurchaser: [],
      libraAddress: ''
    }
  },
  async created() {
    setTimeout(async () => {
      if (this.$nuxt.$route.params.id == undefined) {
        this.libraAddress = this.$store.state.user.libraAddress
      } else {
        this.libraAddress = this.$nuxt.$route.params.id
      }

      const sellerReviewRef = await firestore
        .collection('sellerReview')
        .where('seller', '==', this.libraAddress)
        .limit(20)

      sellerReviewRef.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            this.reviewsAsSeller.push(change.doc.data())
          }
          if (change.type === 'modified') {
            this.reviewsAsSeller.push(change.doc.data())
          }
        })
      })

      const purchaserReviewRef = await firestore
        .collection('purchaserReview')
        .where('purchaser', '==', this.libraAddress)
        .limit(20)

      purchaserReviewRef.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            this.reviewsAsPurchaser.push(change.doc.data())
          }
          if (change.type === 'modified') {
            this.reviewsAsPurchaser.push(change.doc.data())
          }
        })
      })
    }, 1)
  }
}
</script>

<style scoped>
.review-field {
  overflow: hidden;
}

h3 {
  padding: 0px 0px 7px 5px;
}

.review-list {
  float: left;
  width: 47%;
  margin-bottom: 50px;
}

.purchaser-review {
  border-left: 1px solid black;
  padding-left: 5%;
}

.review-from {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
