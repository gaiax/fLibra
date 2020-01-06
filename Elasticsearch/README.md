# Elasticsearch

## Install elasticsearch and Kuromoji for Japanese search
Install elasticsearch 
https://www.elastic.co/guide/en/elasticsearch/reference/7.4/brew.html

Install kuromoji
https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-kuromoji.html


## Add index and start up elasticsearch in local
```
cd /usr/local/var/homebrew/linked/elasticsearch-full //please find your path
curl -XPUT 'localhost:9200/flibra?pretty'
bin/elasticsearch
```
## Start node to connect firastore and elasticsearch

config
```.env
ES_HOST = localhost:9200
apiKey = AIzaSyAIqQE55...i0UrqM-miX-k
authDomain = flibra...-80092.firebaseapp.com
databaseURL = https://flibra....firebaseio.com
projectId = flibra...-80092
storageBucket = gs://flibra...-80092.appspot.com
messagingSenderId = 2472...9401
appId = 1:247244459401:web:af0d3f277789fdfcfe2558
```

```
cd Elasticsearch
npm i
node app.js
```
