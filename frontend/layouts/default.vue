<template>
  <div>
    <Header />
    <div class="container"><nuxt /></div>
  </div>
</template>

<script>
import Header from '@/components/Header'
export default {
  components: {
    Header
  }
}
</script>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

body {
  background-color: #f1f1f1;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.container {
  width: 660px;
  margin: 0 auto 40px;
}
</style>
