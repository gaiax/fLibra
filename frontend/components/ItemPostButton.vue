<template>
  <nuxt-link :to="{ path: link }" no-prefetch>
    <div class="item-post-icon" @click="notification">
      <p class="item-post-text">Sell</p>
      <div class="icon">
        <i class="el-icon-plus"></i>
      </div>
    </div>
    <el-dialog :visible.sync="visibleSignIn" style="text-align: center;">
      <p>Please sign in</p>
      <nuxt-link :to="{ path: subLink }" no-prefetch>
        <el-button class="button--grey">Go to sign in</el-button>
      </nuxt-link>
    </el-dialog>
    <el-dialog :visible.sync="visibleMypage" style="text-align: center;">
      <p>Please register your user information before selling your item</p>
      <nuxt-link :to="{ path: subLink }" no-prefetch>
        <el-button class="button--grey">Go to my page</el-button>
      </nuxt-link>
    </el-dialog>
  </nuxt-link>
</template>

<script>
export default {
  props: ['link', 'subLink'],
  data: function() {
    return {
      visibleSignIn: false,
      visibleMypage: false
    }
  },
  methods: {
    async notification() {
      if (this.link == '') {
        if (this.subLink == '/signin') {
          this.visibleSignIn = true
        } else {
          this.visibleMypage = true
        }
      }
    }
  }
}
</script>

<style scoped>
.item-post-icon {
  border-radius: 50%;
  position: fixed;
  height: 100px;
  width: 100px;
  bottom: 50px;
  right: 60px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
}

.item-post-icon:hover {
  color: #fff;
  background-color: #35495e;
}

.item-post-text {
  padding-top: 15px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.icon {
  text-align: center;
  font-size: 40px;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  margin-top: 3%;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
