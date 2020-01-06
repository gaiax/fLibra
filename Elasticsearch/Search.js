'use strict';

const firebase = require('firebase');
require('firebase/firestore');
const _ = require('lodash');

class Search {

  constructor(esc, refReq, refRes, index, type) {
    this.esc = esc;
    this.refReq = refReq;
    this.refRes = refRes;
    this.index = index;
    this.type = type;
  }

  init() {
    this.refReq = firebase.firestore().collection(this.refReq);
    this.refRes = firebase.firestore().collection(this.refRes);
    this.unsubscribe = null;
    this.unsubscribe = this.refReq.onSnapshot(this._showResults.bind(this));
  }

  _showResults(snap) {
    snap.forEach((doc) => {
      let { from, searchText, size, category } = doc.data();
      // 全文検索のみの場合
      if(category == 0 ) {
        let query = {
          index: this.index,
          type: this.type,
          body: {
            query: {
              bool : {
                should : [
                  {match: {itemName: searchText }},
                  {match: {itemDetailText: searchText }}
                ]
              }
            },
            _source : ['itemId', 'itemName', 'price', 'itemPhoto'],
          },
          from,
          size,
        }
        this._searchWithElasticsearch(doc, query)
      }
      // 全文検索 + カテゴリー検索
      else {
        let query = {
          index: this.index,
          type: this.type,
          body: {
            query: {
              bool: {
                must: [
                    {
                      bool: {
                        should: [
                          {match: {itemName: searchText }},
                          {match: {itemDetailText: searchText }}
                        ]
                      }
                    },
                    {
                      bool: {
                        must: {
                          term: { category : category }
                        }
                      }
                    }
                  ]
                }
              },
              _source : ['itemId', 'itemName', 'price', 'itemPhoto']
            },
            from,
            size,
          }
          this._searchWithElasticsearch(doc, query)
        }
      })
    }

    _searchWithElasticsearch(doc, query) {
      this.esc.search(query, function(error, response) {
        if(_.isUndefined(error)){
          let returnData = {}
          let id = 0
          response.hits.hits.forEach((data) => {
            returnData[id] = {
              itemId : data._source.itemId,
              itemName : data._source.itemName,
              itemPhoto : data._source.itemPhoto,
              price : data._source.price
            }  
            id++
          })
          console.log('_searchWithElasticsearch: success', query, returnData)
          this.refRes.doc(doc.id).set(returnData);
          this.refReq.doc(doc.id).delete();
        }else{
          console.log('_searchWithElasticsearch: failed', error)
        }
      }.bind(this));
    }

}

exports.init = function(esc, refReq, refRes, index, type) {
  new Search(esc, refReq, refRes, index, type).init();
}