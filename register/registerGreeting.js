const Web3 = require('web3');
const fs = require('fs');
const ethereum = require('./ethereum');

/*
Test1:
Greeting: 0x42E64FE066CDe431F0EbEB53a77f427F5f0D87d8
Computing: 0x79aEb29541cCba967C75133588371f34bA739721
PlatON:
Greeting: 0x44fb65cFbA6c07d91d71031A3dACaa8C93a73Df5
Computing: 0xe55eDA7Ab7eCD2ce2c55cdf938488b462F7a5c0A
*/

// const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
const web3 = new Web3('wss://devnetopenapi2.platon.network/ws');
web3.eth.handleRevert = true;
// const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
// const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/94ebec44ffc34501898dd5dccf387f81');
const crossChainContractAddress = '0x4E6D2E51e153BC2a80c2947AF868e9A1A0789913';
const nearGreetingContractAddress = '9f9350eb575cae7aac7f85a8c62b08d94dcac70a84e3c765464ff87c669fa4e5';
// const POLKADOT = "5CBD313ffFKkibotMZGMJpFpFshL237Lfv1rrsoj5qGrgQTz";
const SHIBUYA = "5CqHgtxcuqhng95pxXvS25hBCPXNv9wKhvSktK7SgtDPjBTd";
const destGreetingContractAddress = '0x44fb65cFbA6c07d91d71031A3dACaa8C93a73Df5';
const CHAIN_ID = 2203181;

// Test account
let testAccountPrivateKey = fs.readFileSync('.secret').toString();

// Greeting smart contract address
const address = fs.readFileSync('./build/address.json');
const greetingContractAddress = JSON.parse(address).greetingsContractAddress;

// Load contract abi, and init greeting contract object
const greetingRawData = fs.readFileSync('./build/contracts/Greetings.json');
const greetingAbi = JSON.parse(greetingRawData).abi;
const greetingContract = new web3.eth.Contract(greetingAbi, greetingContractAddress);

(async function init() {
  // destination chain name
  const destinationChainName = 'PLATONEVMDEV';

  // greeting contract action name
  const contractActionName = 'receiveGreeting';

  // greeting contract destination action name
  const destContractActionName = '0x2d436822';

  // Get current date
  function getCurrentDate() {
    var today = new Date();
    return today.toString();
  }

  // Set cross chain contract address
  // await ethereum.sendTransaction(web3, CHAIN_ID, greetingContract, 'setCrossChainContract', testAccountPrivateKey, [crossChainContractAddress]);
  // Register contract info for sending messages to other chains
  // await ethereum.sendTransaction(web3, CHAIN_ID, greetingContract, 'registerDestnContract', testAccountPrivateKey, [contractActionName, destinationChainName, destGreetingContractAddress, destContractActionName]);

  // await ethereum.sendTransaction(web3, CHAIN_ID, greetingContract, 'sendGreeting', testAccountPrivateKey, [destinationChainName, ['PLATON', 'Greetings', 'Greeting from PLATON', getCurrentDate()]]);
  let a = await ethereum.contractCall(greetingContract, 'greetings', [2]);
  // let a = await ethereum.contractCall(greetingContract, 'verify', [destinationChainName, contractActionName, destGreetingContractAddress]);
  // let a = await ethereum.contractCall(greetingContract, 'permittedContractMap', [destinationChainName, contractActionName]);
  // let a = await ethereum.contractCall(greetingContract, 'crossChainContract', []);
  console.log(a)
}());
