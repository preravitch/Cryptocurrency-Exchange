// src/Web3Client.js
import Web3 from 'web3'

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        try {
          await window.ethereum.enable()
          resolve(web3)
        } catch (error) {
          reject(error)
        }
      } else {
        reject('Please install MetaMask!')
      }
    })
  })

export default getWeb3
