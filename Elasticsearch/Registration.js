'use strict';

const firebase = require('firebase');
require('firebase/firestore');
const _ = require('lodash');

class Registration {

  constructor(esc, collection, index, type) {
    this.esc = esc;
    this.collection = collection;
    this.index = index;
    this.type = type;
  }

  init() {
    this.ref = firebase.firestore().collection(this.collection).where('ES_STATE', '==', 'Not yet');
    this.unsubscribe = null;
    this.unsubscribe = this.ref.onSnapshot(this._showResults.bind(this));
  }

  _showResults(snap) {
    snap.forEach((doc) => {
      const sendData = {
        index: this.index,
        type: this.type,
        id: doc.data().itemId,
        body: {
          itemId: doc.data().itemId,
          itemDetailContract: doc.data().itemDetailContract,
          purchaser: doc.data().purchaser,
          seller: doc.data().seller,
          selling: doc.data().selling,
          itemName: doc.data().itemName,
          itemPhoto: doc.data().itemPhoto,
          price: doc.data().price,
          itemDetailText: doc.data().itemDetailText,
          category: doc.data().category,
          itemCondition: doc.data().itemCondition,
        },  
      }
      this._sendDataToElasticsearch(sendData)
      this._updateFlagInFirestore(doc)
    })
  }

  _sendDataToElasticsearch(sendData) {
    this.esc.index(sendData, function (error, response) {
      if(_.isUndefined(error)){
        console.log('_sendDataToElasticsearch: success')
      }else{
        console.log('_sendDataToElasticsearch: failed', error)
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
      console.error('_updateFlagInFirestore: failed', error);
    });
  }
}

exports.init = function(esc, collection, index, type) {
  new Registration(esc, collection, index, type).init();
}