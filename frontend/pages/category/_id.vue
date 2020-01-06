<template>
  <div>
    <SearchFunction defaultText="" />
    <div class="search-key">
      <p style="font-weight: 500">Search result of {{ category }}</p>
    </div>
    <ItemList :items="categorizedItems" />
    <ItemPostButton />
  </div>
</template>

<script>
import firestore from '~/plugins/firestore'
import SearchFunction from '@/components/SearchFunction'
import ItemList from '@/components/ItemList'
import ItemPostButton from '@/components/ItemPostButton'
import itemOption from '~/assets/itemOption.json'

export default {
  components: {
    SearchFunction,
    ItemList,
    ItemPostButton
  },
  data: function() {
    return {
      searchText: '',
      category: '',
      categorizedItems: []
    }
  },
  async created() {
    await firestore
      .collection('items')
      .where('category', '==', Number(this.$nuxt.$route.params.id))
      .where('selling', '==', true)
      .orderBy('itemId', 'desc')
      .limit(20)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching documents.')
          return
        }
        snapshot.forEach(doc => {
          this.categorizedItems.push(doc.data())
        })
      })
      .catch(err => {
        console.log('Error getting documents', err)
      })
    let categoryNumber = Number(
      String(this.$nuxt.$route.params.id).charAt(0) - 1
    )
    this.category = itemOption.categoryList[categoryNumber].label
  }
}
</script>

<style scoped>
.search-key {
  padding: 10px;
}
</style>
