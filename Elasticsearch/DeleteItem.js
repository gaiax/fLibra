'use strict';

const firebase = require('firebase');
require('firebase/firestore');
const _ = require('lodash');

class DeteleItem {

  constructor(esc, collection, index, type) {
    this.esc = esc;
    this.collection = collection;
    this.index = index;
    this.type = type;
  }

  init() {
    this.ref = firebase.firestore().collection(this.collection).where('ES_STATE', '==', 'Item sold');
    this.unsubscribe = null;
    this.unsubscribe = this.ref.onSnapshot(this._showResults.bind(this));
  }

  _showResults(snap) {
    snap.forEach((doc) => {
      const sendData = {
        body: [
          {delete: { _index: this.index, _type: this.type, _id: doc.data().itemId } }
        ]
      }
      this._sendDataToElasticsearch(sendData)
      this._updateFlagInFirestore(doc)
    })
  }

  _sendDataToElasticsearch(sendData) {
    /*
      * firestoreで変更されたデータをElasticsearchに送信する関数
    */
    this.esc.bulk(sendData, function (error, response) {
      if(_.isUndefined(error)){
        console.log('_deleteDataToElasticsearch: success')
      }else{
        console.log('_deleteDataToElasticsearch: failed', error)
      }
    }.bind(this));
  }

  _updateFlagInFirestore(doc) {
    return firebase.firestore().collection(this.collection).doc(doc.id).update({
      'ES_STATE': firebase.firestore.FieldValue.delete(),
    })
    .then(function() {
      console.log('_updateFlagInFirestore: success');
    })
    .catch(function(error) {
      // The document probably doesn't exist.
      console.error('_updateFlagInFirestore: failed', error);
    });
  }

}

exports.init = function(esc, collection, index, type) {
  new DeteleItem(esc, collection, index, type).init();
}
