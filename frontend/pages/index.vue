<template>
  <div>
    <SearchFunction />
    <ItemList :items="onSaleItems" />
    <ItemPostButton />
  </div>
</template>

<script>
import SearchFunction from '@/components/SearchFunction'
import ItemList from '@/components/ItemList'
import ItemPostButton from '@/components/ItemPostButton'
import firestore from '~/plugins/firestore'
import firebase from '~/plugins/firebase'
import 'firebase/firestore'

export default {
  components: {
    SearchFunction,
    ItemList,
    ItemPostButton
  },
  data: function() {
    return {
      onSaleItems: []
    }
  },
  async created() {
    const itemRef = await firestore
      .collection('items')
      .where('selling', '==', true)
      .orderBy('itemId', 'desc')
      .limit(30)

    itemRef.onSnapshot(querySnapshot => {
      this.lastItemId = querySnapshot.docs[0].id
      querySnapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          this.onSaleItems.push(change.doc.data())
          if (change.doc.data().itemId > Number(this.lastItemId)) {
            this.onSaleItems.unshift(change.doc.data())
          }
        }
        if (change.type === 'modified') {
        }
      })
    })
  }
}
</script>

<style scoped></style>
