require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  rpc: {
    host:"0.0.0.0",
    port:8545
  },

  networks: {

    development: {
      host: "127.0.0.1",     
      port: 7545,            
      network_id: "*",       
    },

    local: {
      provider: new HDWalletProvider(process.env.MNEMONIC, process.env.truffleEndpoint),
      network_id: "1515",
      gas: 0,
      gasPrice: 0
    },

  },

  contracts_directory: './contracts/',
  contracts_build_directory: `../frontend/abis/`,

  mocha: {
    //timeout: 100000
  },

  // Configure your compilers
  compilers: {
    // solc: {
    //   version: "native",
    //   optimizer: {
    //     enabled: true,
    //     runs: 200
    //   }
    // }
  }
}
