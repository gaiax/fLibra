<template>
  <div>
    <div class="wrapper">
      <div class="item-list" v-for="item in items" :key="item.itemId">
        <nuxt-link
          :to="'/itemDetail/' + item.itemId"
          style="text-decoration: none;"
          no-prefetch
        >
          <el-card class="item-card" :body-style="{ padding: '0px' }">
            <img
              class="item-image"
              :src="'https://ipfs.io/ipfs/' + item.itemPhoto"
            />
            <div style="padding: 14px;">
              <p class="item-title">{{ item.itemName }}</p>
              <div class="item-info">
                <p>
                  <img
                    src="~/assets/img/libra-coin.png"
                    style="width: 10px; height: 10px;"
                  />
                  {{ item.price }}
                </p>
              </div>
            </div>
          </el-card>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['items']
}
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
}

.item-list {
  padding: 10px;
  width: 33%;
}

.item-card {
  margin-left: 5px;
  margin-bottom: 5px;
}

.item-card:hover {
  border: 1.2px solid #35495e;
}

.item-image {
  height: 170px;
}

.item-title {
  height: 19px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-info {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
</style>
