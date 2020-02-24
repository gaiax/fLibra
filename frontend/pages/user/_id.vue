<template>
  <div>
    <div class="wrapper">
      <div class="image-field">
        <img
          v-if="user.userIcon == 0"
          class="user-image"
          src="~assets/img/flibra.svg"
        />
        <img v-else class="user-image" :src="user.userIcon" />
      </div>
      <div class="user-info">
        <p style="font-size: 25px; font-weight: bold; vertical-align: sub;">
          {{ user.userName }}
        </p>
        <p>
          Seller ★{{ averageSellerReview }} : Purchaser　☆{{
            averagePurchaserReview
          }}
        </p>
      </div>
    </div>
    <ReviewItem />
  </div>
</template>

<script>
import ReviewItem from '@/components/ReviewItem'
import firestore from '~/plugins/firestore'

export default {
  components: {
    ReviewItem
  },
  data: function() {
    return {
      user: {},
      averageSellerReview: '--',
      averagePurchaserReview: '--'
    }
  },
  async created() {
    let userLibraAddress = await this.$nuxt.$route.params.id

    // Seller Review の平均値
    let numberOfReview = 0
    let sumOfStar = 0
    let sellerReviewRef = firestore.collection('sellerReview')
    let starOfsellerReview = await sellerReviewRef
      .where('seller', '==', userLibraAddress)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if (doc.data().text != '') {
            numberOfReview = numberOfReview + 1
            sumOfStar = sumOfStar + doc.data().star
          }
        })
      })
    if (numberOfReview > 0) {
      let averageSellerReview = sumOfStar / numberOfReview
      this.averageSellerReview = Math.round(averageSellerReview * 100) / 100
    }

    // Purchser Review の平均値
    numberOfReview = 0
    sumOfStar = 0
    let purchaserReviewRef = firestore.collection('purchaserReview')
    let starOfpurchaserReview = await purchaserReviewRef
      .where('purchaser', '==', userLibraAddress)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if (doc.data().text != '') {
            numberOfReview = numberOfReview + 1
            sumOfStar = sumOfStar + doc.data().star
          }
        })
      })
    if (numberOfReview > 0) {
      let averagePurchaserReview = sumOfStar / numberOfReview
      this.averagePurchaserReview =
        Math.round(averagePurchaserReview * 100) / 100
    }

    const userInfo = await this.$flibraContract.methods
      .getUserInfo(userLibraAddress)
      .call()
    if (userInfo.userAddress == '') {
      this.user = {
        userName: userLibraAddress,
        userIcon: 0
      }
    } else {
      this.user = {
        userName: userInfo.userName,
        userIcon: 'https://ipfs.io/ipfs/' + userInfo.userIcon
      }
    }
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
  text-align: center;
  width: 40%;
}

.user-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.user-info {
  width: 60%;
  padding: 40px 0px;
}

.user-info p {
  padding: 5px 0px;
}
</style>
