<template>
  <header>
    <nuxt-link to="/" no-prefetch>
      <h1><img src="~assets/img/flibra.svg" class="logo" />FLIBRA</h1>
    </nuxt-link>
    <p>
      This is a demo website. <span style="font-size: 15px; font-weight: 600;">DO NOT trade real items</span>.<br />
      Please read application instruction from
      <a class="document" href="https://medium.com/@gnx.vw903/flea-market-using-libra-and-ethereum-c063e5e5723c" target="_blank">here</a>.
    </p>
    <nav>
      <div v-if="libraAddress == ''">
        <nuxt-link to="/createLibraWallet" class="button--grey" no-prefetch
          >Create Libra Wallet</nuxt-link
        >
        <nuxt-link to="/signin" class="button--grey" no-prefetch
          >Sign In</nuxt-link
        >
      </div>
      <div v-else>
        <div class="button--grey" @click="viewSignout = true">Sign out</div>
        <nuxt-link to="/myPage" class="button--grey" no-prefetch
          >My Page</nuxt-link
        >
        <el-dialog
          :visible.sync="viewSignout"
          style="text-align: center;"
          title="Sign out?"
        >
          <p class="button--grey" @click="signout()">Confirm</p>
        </el-dialog>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  data() {
    return {
      viewSignout: false
    }
  },
  computed: {
    libraAddress() {
      return this.$store.state.user.libraAddress
    }
  },
  methods: {
    async signout() {
      await this.$store.commit('user/setlibraAddress', '')
      await this.$store.commit('user/setmnemonic', '')
      await this.$store.commit('user/setetherAddress', '')
      await this.$store.commit('user/setetherPk', '')
      location.href = `${process.env.URL}/`
    }
  }
}
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  padding: 16px;
  line-height: 1.5;
  background-color: white;
}

h1 {
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 28px;
}

.logo {
  width: 40px;
  height: 40px;
  vertical-align: middle;
}

nav {
  margin-left: auto;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 5px 10px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}

.document {
  font-size: 15px;
  font-weight: 600;
  color: blue;
  text-decoration: underline;
}

p {
  font-size: 13px;
  padding-left: 3%; 
}

a {
  text-decoration: none;
  color: black;
}
</style>
