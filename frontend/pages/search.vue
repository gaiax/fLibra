<template>
  <div>
    <SearchFunction :defaultText="$route.query.keyword" />
    <div class="search-key">
      <p style="font-weight: 500">
        Search result of {{ $route.query.keyword }}
      </p>
    </div>
    <ItemList :items="searchedItems" />
    <ItemPostButton />
  </div>
</template>

<script>
import firestore from '~/plugins/firestore'
import SearchFunction from '@/components/SearchFunction'
import ItemList from '@/components/ItemList'
import ItemPostButton from '@/components/ItemPostButton'

export default {
  components: {
    SearchFunction,
    ItemList,
    ItemPostButton
  },
  data() {
    return {
      searchText: '',
      sunC: '',
      searchedItems: [],
      ref_item: firestore.collection('items'),
      ref_req: firestore.collection('search_request'),
      ref_res: firestore.collection('search_response')
    }
  },
  async created(context) {
    const ref_req = firestore.collection('search_request')
    let query = {
      index: 'flibra',
      type: 'item',
      size: 30,
      from: 0,
      searchText: this.$nuxt.$route.query.keyword,
      category: Number(this.$nuxt.$route.query.id)
    }
    const snap = await this.ref_req.add(query)
    const key = await snap.id
    let item = await this.ref_res.doc(key).onSnapshot(async snap => {
      if (snap.data() == undefined) {
        return
      } else {
        this.searchedItems = await snap.data()
        await snap.ref.delete()
      }
    })
  }
}
</script>

<style scoped>
.search-key {
  padding: 10px;
}
</style>
