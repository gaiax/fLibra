export const state = () => ({
  onSaleItems: [],
  categorizedItems: [],
  searchedItems: [],
  myPostedItems: [],
  myPurchaedItems: [],
  reviewsAsSeller: [],
  reviewsAsPurchaser: []
})

export const mutations = {
  setOnSaleItems(state, item) {
    state.onSaleItems.push(item)
  },
  setMyPostedItems(state, item) {
    state.myPostedItems.push(item)
  },
  setMyPurchaedItems(state, item) {
    state.myPurchaedItems.push(item)
  },
  setmyReviewsAsSeller(state, item) {
    state.myReviewsAsSeller.push(item)
  },
  setmyReviewsAsPurchaser(state, item) {
    state.myReviewsAsPurchaser.push(item)
  },
  setSearchedItems(state, item) {
    state.searchedItems.push(item)
  }
}

export const actions = {
  // async getOnSaleItems({commit, state}) {
  //   const numberOfItem = await this.$flibraContract.methods.getNumberOfItem().call()
  //   if (numberOfItem > 0 ) {
  //     for ( var i = 0; i < numberOfItem; i++ ) {
  //       const item = await this.$flibraContract.methods.getItemOnSale(i).call()
  //       //console.log(item)
  //       if (item.selling === Boolean("true")) {
  //         commit('setOnSaleItems', item)
  //       }
  //     }
  //   }
  // },
  // -----  投稿したアイテムとPurchaserにReviewを書くための情報  -----
  // -----  自分のSellerとしてのReview  -----
  // async getMyPostedItems({commit, state}, app) {
  //   const libraAddress = await app.$store.state.user.libraAddress
  //   const myItemId = await this.$flibraContract.methods.getMyItemId(libraAddress).call()
  //   for ( var j = 0 ; j < myItemId.length; j++ ) {
  //     const myItem = await this.$flibraContract.methods.getMyItem(myItemId[j]).call()
  //     // List of Review to Purchaser
  //     const writeReviewToPurchaser = await this.$flibraContract.methods.getPurchaserReview(myItemId[j]).call()
  //     const myPostedItemInfo = await Object.assign(myItem, writeReviewToPurchaser);
  //     commit('setMyPostedItems', myPostedItemInfo)
  //     // My Review as Seller
  //     const myReviewAsSeller = await this.$flibraContract.methods.getSellerReview(myItemId[j]).call()
  //     if (myReviewAsSeller.text !== "") {
  //       const purchaser = {'purchaser': myItem.purchaser }
  //       const myReviewAsSellerInfo = await Object.assign(myReviewAsSeller, purchaser);
  //       commit('setmyReviewsAsSeller', myReviewAsSellerInfo)
  //     }
  //   }
  // },
  // -----  購入したアイテムとSellerにReviewを書くための情報  -----
  // -----  自分のSellerとしてのReview  -----
  // async getMyPurchaedItems({commit, state}, app) {
  //   const libraAddress = await app.$store.state.user.libraAddress
  //   const myPurchaedItemId = await this.$flibraContract.methods.getMyPurchasedItemId(libraAddress).call()
  //   for ( var k = 0 ; k < myPurchaedItemId.length; k++ ) {
  //     const myPurchaedItem = await this.$flibraContract.methods.getMyPurchasedItem(myPurchaedItemId[k]).call()
  //     //console.log(myPurchaedItem)
  //     // List of Review to Seller
  //     const writeReviewToSeller = await this.$flibraContract.methods.getSellerReview(myPurchaedItemId[k]).call()
  //     const myPurchasedItemInfo = await Object.assign(myPurchaedItem, writeReviewToSeller);
  //     commit('setMyPurchaedItems', myPurchasedItemInfo)
  //     // My Review as Purchaser
  //     const purchaserReview = await this.$flibraContract.methods.getPurchaserReview(myPurchaedItemId[k]).call()
  //     if (purchaserReview.text !== "") {
  //       const seller = {'seller': myPurchaedItem.seller}
  //       const purchaserReviewInfo = Object.assign(purchaserReview, seller)
  //       console.log(purchaserReviewInfo)
  //       commit('setmyReviewsAsPurchaser', purchaserReview)
  //     }
  //   }
  // }
}
