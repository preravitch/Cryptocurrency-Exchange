import Web3 from 'web3';

let web3;

if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.enable().catch(error => {
        // User denied account access
        console.error("User denied account access", error);
    });
} else if (window.web3) {
    // Legacy dapp browsers...
    web3 = new Web3(window.web3.currentProvider);
} else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
}

export default web3;
