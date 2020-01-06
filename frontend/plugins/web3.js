import Web3 from 'web3'
import flibra from '~/abis/Flibra.json'

export default async function({ store }, inject) {
  const web3 = await new Web3(
    new Web3.providers.HttpProvider(process.env.web3Endpoint)
  )

  let networkId = await web3.eth.net.getId()

  let flibraContract = await new web3.eth.Contract(
    flibra.abi,
    flibra.networks[networkId].address
  )

  inject('web3', web3)
  inject('flibraContract', flibraContract)
}
