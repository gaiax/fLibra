<template>
  <div>
    <div class="search-bar">
      <el-input
        :placeholder="defaultText"
        v-model="searchText"
        @keyup.enter.native="search"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="search"
        ></el-button>
      </el-input>
    </div>
    <div v-on:mouseleave="categorySearchLeaveMouse">
      <div class="category-title">
        <h4 v-on:mouseover="categoryOpen = true">Categories</h4>
      </div>
      <div class="searchCategory">
        <div class="categotyList">
          <ul>
            <li
              class="categoryName"
              v-if="categoryOpen"
              v-for="category in categoryList"
              v-on:mouseover="categoryMouseOver(category.value)"
              @click="search"
            >
              {{ category.label }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import itemOption from '~/assets/itemOption.json'

export default {
  props: ['defaultText'],
  data: function() {
    return {
      searchText: '',
      value: '',
      category: '',
      options: itemOption.options,
      categoryOpen: false,
      categoryList: itemOption.categoryList
    }
  },
  computed: {},
  methods: {
    categorySearchLeaveMouse() {
      this.categoryOpen = false
    },
    categoryMouseOver(categoryValue) {
      this.category = categoryValue
    },
    async search() {
      //カテゴリーの記入のみの場合はFirestoreでカテゴリー検索
      if (this.category !== undefined && this.searchText == '') {
        location.href = `${process.env.URL}/category/${this.category}`
      } else {
        if (this.category == undefined) {
          this.category = 0
        } //FiresotreにUndefinedを保存できないため
        location.href = `${process.env.URL}/search/?id=${this.category}&keyword=${this.searchText}`
      }
    }
  }
}
</script>

<style scoped>
.search-bar {
  padding: 10px;
  width: 100%;
  display: inline-block;
}

.category-title {
  padding-left: 10px;
  display: inline-block;
}

.searchCategory {
  overflow: hidden;
}

.categotyList {
  padding-left: 10px;
  float: left;
}

.categotyList ul {
  list-style: none;
}

.categotyList ul li {
  padding: 5px 0px;
}

.categotyList ul li:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
