<template>
  <h1>Hello</h1>
</template>
<script>
export default {
  async asyncData({ app }) {
    const res = await app.$axios.$get(
      'https://apitest.moveonlibra.com/v1/address/balance/a06c2e275db714d4a8d7b574ddf1d29acef2ddc8c26e7cbd3f2cb720779649d6'
    )
    console.log(res)
  }
}
</script>
