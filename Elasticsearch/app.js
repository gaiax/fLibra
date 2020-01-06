
const firebase = require('firebase');
require('firebase/firestore');
const elasticsearch = require('elasticsearch');
require('dotenv').config();
require('./firebase.js')
let Search = require('./Search.js');
let Registration = require('./Registration.js');
let DeteleItem = require('./DeleteItem.js');

const escOptions = {
  host: process.env.ES_HOST
};

let esc = new elasticsearch.Client(escOptions);
console.log('Connecting to ElasticSearch host %s', process.env.ES_HOST);

let timeoutObj = setInterval(function() {
  esc.ping().then(function() {
    console.log('Connected to ElasticSearch host %s', process.env.ES_HOST);
    clearInterval(timeoutObj);
    Search.init(esc, refReq='search_request', refRes='search_response', index='flibra', type='item');
    Registration.init(esc, collection='items', index='flibra', type='item');
    DeteleItem.init(esc, collection='items', index='flibra', type='item');
  });
}, 5000);