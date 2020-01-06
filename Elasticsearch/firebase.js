const firebase = require('firebase');
require('firebase/firestore');
require('dotenv').config();

if (!firebase.apps.length) {
  firebase.initializeApp(
    {
      apiKey: process.env.apiKey,
      authDomain: process.env.authDomain,
      databaseURL: process.env.databaseURL,
      projectId: process.env.projectId,
      storageBucket: process.env.storageBucket,
      messagingSenderId: process.env.messagingSenderId,
      appId: process.env.appId
    }
  )
};

// export default firebase;