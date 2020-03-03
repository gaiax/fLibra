<template>
  <div>
    <el-form
      ref="form"
      :model="form"
      label-width="120px"
      style="padding-top: 30px;"
    >
      <el-form-item label="Item Name" required>
        <el-input
          type="text"
          placeholder="Please type your item name"
          v-model="form.itemName"
        ></el-input>
      </el-form-item>
      <el-form-item label="Photo" required>
        <input type="file" accept=".jpg, .jpeg, .png" placeholder="Please input" @change="captureFile" />
      </el-form-item>
      <el-form-item label="Price" required>
        <el-input
          type="number"
          placeholder="Please set your item price"
          v-model="form.price"
        ></el-input>
      </el-form-item>
      <el-form-item label="Detail" required>
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 15 }"
          placeholder="Please describe your item detail"
          v-model="form.itemDetailText"
        ></el-input>
      </el-form-item>
      <el-form-item label="Category" required>
        <el-select v-model="form.category" placeholder="Category">
          <el-option
            v-for="item in categoryList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Item condition" required>
        <el-select v-model="form.itemCondition" placeholder="Item condition">
          <el-option
            v-for="item in itemConditionList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="text-align: right" required>
        <el-button class="button--grey" v-loading="loading" @click="postItem"
          >Sell Item</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import ItemDetail from '../abis/ItemDetail.json'
import flibra from '../abis/Flibra.json'
import Common from 'ethereumjs-common'
import itemOption from '~/assets/itemOption.json'
import firestore from '~/plugins/firestore'

export default {
  data: function() {
    return {
      categoryList: itemOption.categoryList,
      itemConditionList: itemOption.itemConditionList,
      loading: false,
      form: {
        itemName: '',
        price: '',
        buffer: '',
        itemDetailText: '',
        category: '',
        itemCondition: ''
      }
    }
  },
  computed: {
    libraAddress() {
      return this.$store.state.user.libraAddress
    },
    etherAddress() {
      return this.$store.state.user.etherAddress
    }
  },
  methods: {
    async captureFile(e) {
      event.preventDefault()
      const file = await event.target.files[0]
      const reader = await new window.FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => {
        this.form.buffer = Buffer(reader.result)
      }
    },
    async postItem() {
      this.loading = true
      let result = await this.$ipfs.add(this.form.buffer)
      const libraAddress = await this.$store.state.user.libraAddress
      const address = await this.$store.state.user.etherAddress
      const pk = await this.$store.state.user.pk
      await this.$web3.eth.accounts.wallet.add({
        privateKey: pk,
        address: address
      })
      this.$web3.eth.defaultAccount = await address

      // ------------- あとでplugin化? -------------
      const customCommon = Common.forCustomChain(
        'mainnet',
        {
          name: 'privatechain',
          networkId: 1515,
          chainId: 1515
        },
        'petersburg'
      )
      const itemContract = new this.$web3.eth.Contract(ItemDetail.abi)

      const hexdata = await itemContract
        .deploy({
          data: ItemDetail.bytecode,
          arguments: [
            this.form.itemName,
            result[0].hash,
            this.form.price,
            this.form.itemDetailText,
            Number(this.form.category),
            Number(this.form.itemCondition)
          ]
        })
        .encodeABI()

      const nonce = await this.$web3.eth.getTransactionCount(address)

      const nonceHex = await this.$web3.utils.toHex(nonce)
      const gasPriceHex = await this.$web3.utils.toHex(0)
      const gasLimitHex = await this.$web3.utils.toHex(5000000)

      const details = await {
        nonce: nonceHex,
        gasPrice: gasPriceHex,
        gasLimit: gasLimitHex,
        from: address,
        data: hexdata
      }

      const EthereumTx = require('ethereumjs-tx').Transaction
      const transaction = await new EthereumTx(details, {
        common: customCommon
      })

      const privatekey = await Buffer.from(pk.slice(2), 'hex')

      await transaction.sign(privatekey)

      const rawdata = (await '0x') + transaction.serialize().toString('hex')

      let app = this
      let web3 = this.$web3
      let flibraContract = this.$flibraContract

      let ref_item = await firestore.collection('items')

      await this.$web3.eth
        .sendSignedTransaction(rawdata)
        .on('receipt', async receipt => {
          const gasPrice = await web3.eth.getGasPrice()
          const gasEstimate = await flibraContract.methods
            .postItem(receipt.contractAddress, libraAddress)
            .estimateGas({ from: web3.eth.defaultAccount })

          const functionAbi = await flibraContract.methods
            .postItem(receipt.contractAddress, libraAddress)
            .send({
              from: web3.eth.defaultAccount,
              gas: gasEstimate,
              gasPrice: gasPrice
            })
            .on('receipt', async receipt => {
              let itemContract = await new web3.eth.Contract(
                ItemDetail.abi,
                receipt.events.PostItem.returnValues.itemDetailContract
              )
              let itemDetailResult = await itemContract.methods.getItem().call()

              await ref_item.doc(receipt.events.PostItem.returnValues.id).set({
                itemId: Number(receipt.events.PostItem.returnValues.id),
                itemDetailContract:
                  receipt.events.PostItem.returnValues.itemDetailContract,
                purchaser: receipt.events.PostItem.returnValues.purchaser,
                seller: receipt.events.PostItem.returnValues.seller,
                selling: receipt.events.PostItem.returnValues.selling,
                itemName: itemDetailResult.itemName,
                itemPhoto: itemDetailResult.itemPhoto,
                price: Number(itemDetailResult.price),
                itemDetailText: itemDetailResult.itemDetailText,
                category: Number(itemDetailResult.category),
                itemCondition: Number(itemDetailResult.itemCondition),
                ES_STATE: 'Not yet'
              })
              app.loading = await false
              await this.$message({
                showClose: true,
                message: 'Successfully posted your item.',
                type: 'success'
              })
              await this.$router.push('/')
            })
            .on('error', console.error)
        })
        .on('error', console.error)
    }
  },
  async mounted() {}
}
</script>

<style scoped>
.button--grey {
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  background-color: #f1f1f1;
  text-decoration: none;
  height: 40px;
  width: 110px;
  font-size: 14px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
