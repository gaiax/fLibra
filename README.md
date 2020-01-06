# FLibra (Libra x Flea market)
![FLibra](images/flibra.png)


## Demo website
https://flibra.gaiax-blockchain.com/


## Document
https://medium.com/@gnx.vw903/flea-market-using-libra-and-ethereum-c063e5e5723c


##  FLibra architect
![architect](images/architect.png)


## Developer's guide

You have 5 steps to build application.
1. Build blockchain and node
2. Deploy contract
3. Set up firestore
4. Set up elasticsearch
5. Set up frontend

##  Install 

```
git clone git@github.com:gaiax/fLibra.git
cd fLibra
```

## 1. Build blockchain and node

We already set blockchain and node in flibrachain direcotry.
Node information is delow. 
```
account : 0xfaee131c16caff0838ac1b91bfb881f7378cc40f
password : Sample
```

### Start blockchain
```
cd flibrachain
geth --datadir node1/ --syncmode 'full' --port 30311 --rpc --rpcaddr '0.0.0.0' --rpcport 8545 --rpccorsdomain "*" --rpcvhosts "*" --rpcapi 'personal,db,eth,net,web3,txpool,miner' --ws --wsapi 'eth,web3,net' --wsorigins='*' --wsaddr='0.0.0.0' --wsport 8546 --networkid 1515 --gasprice '0'
```

### Start mining
```
geth attach ipc:node1/geth.ipc
> personal.unlockAccount(eth.coinbase,"Sample",0)
> miner.start()
```

Block gas limit is guradually increase, so you may have to wait until block gas limit reaaches at `8000000` 

If you want to create new private blockchain, you can check this. 
https://github.com/gaiax/fLibra/tree/master/flibrachain 

## 2. Deploy contract

Move on truffle directory and install dependencies.
```
cd truffle
npm i
```

### Config
```
MNEMONIC = "receive risk draw record wheel ... benefit broccoli cruel net present topic"
truffleEndpoint = http://0.0.0.0:8545
```
Please use your mnemonic phrase.

### Deploy contract 
```
$ truffle console --network local
truffle(local)> migrate --reset
```
If you successfully deployed contract, you can find JSON file in "../frontend/abis/"

## 3. Set up firestore
Please create a project on Firebase.
https://firebase.google.com/docs/firestore/quickstart

Connect your repository with firebase project
```
npm install -g firebase-tools 
// or
yarn add firebase-tools
firebase login
firebase init
```

## 4. Set up elasticsearch

If you already installed elasticsearch, you can skip this step.

### Install elasticsearch and Kuromoji for Japanese search
Install elasticsearch 
https://www.elastic.co/guide/en/elasticsearch/reference/7.4/brew.html

Install kuromoji
https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-kuromoji.html


### Add index and start up elasticsearch in local
```
cd /usr/local/var/homebrew/linked/elasticsearch-full //please find your path
curl -XPUT 'localhost:9200/flibra?pretty'
bin/elasticsearch
```

### Start node to connect firastore and elasticsearch

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

## 5. Set up frontend
```
cd frontend 
```

### Config

Plase set your firebase project key in config.
```.env
libraMnemonic = "birth easily sword divert scale main physical dune menu exist marriage trophy true quick nerve clown equal short assist taste flame grant vintage erase"
apiKey = AIzaSyAIqQE55...i0UrqM-miX-k
authDomain = flibra...-80092.firebaseapp.com
databaseURL = https://flibra....firebaseio.com
projectId = flibra...-80092
storageBucket = gs://flibra...-80092.appspot.com
messagingSenderId = 2472...9401
appId = 1:247244459401:web:af0d3f277789fdfcfe2558
web3Endpoint = http://0.0.0.0:8545
URL = http://localhost:3000
```

```
npm i 
npm run dev
```

## Contributing

Pull requests and stars are always welcome.

1. Fork it!
2. Create your feature branch: git checkout -b my-new-feature
3. Commit your changes: git commit -am 'Add some feature'
4. Push to the branch: git push origin my-new-feature
5. Submit a pull request :D

