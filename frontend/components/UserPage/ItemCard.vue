<template>
  <div>
    <nuxt-link
      :to="'/itemDetail/' + item.itemId"
      style="text-decoration: none;"
      no-prefetch
    >
      <img class="item-image" :src="'https://ipfs.io/ipfs/' + item.itemPhoto" />
      <div class="item-info">
        <p style="height: 19px;">{{ item.itemName }}</p>
        <p style="padding-top: 5px;">
          <img
            src="~/assets/img/libra-coin.png"
            style="width: 14px; height: 14px;"
          />
          {{ item.price }}
        </p>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
export default {
  props: ['item']
}
</script>

<style scoped>
.item-image {
  height: 200px;
}

.item-info {
  color: black;
  padding: 10px 0px 0px 20px;
}
</style>
