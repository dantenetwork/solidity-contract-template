const Web3 = require('web3');
const fs = require('fs');
const ethereum = require('./ethereum');

/*
Test1:
Greeting: 0xa9cCbB3FC3215109c7c214c8E02EF91fD3FdEfb8
Computing: 0x45B200D9caFAc6067d7bf7e93C49F4D51314B6B5
PlatON:
Greeting: 0xA2344a15989D9f9762F19c53cf0040EF47F664Bd
Computing: 0x4EC04F2697FED60372CD5d6CfDC9F4Cb159C2493
*/

// const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
const web3 = new Web3('wss://devnetopenapi2.platon.network/ws');
web3.eth.handleRevert = true;
// const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
// const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/94ebec44ffc34501898dd5dccf387f81');
const crossChainContractAddress = '0x17caBf5d2A65Da01f5D45E35c5cCedE61AFaD332';
const nearGreetingContractAddress = '9f9350eb575cae7aac7f85a8c62b08d94dcac70a84e3c765464ff87c669fa4e5';
// const POLKADOT = "5CBD313ffFKkibotMZGMJpFpFshL237Lfv1rrsoj5qGrgQTz";
const SHIBUYA = "5CqHgtxcuqhng95pxXvS25hBCPXNv9wKhvSktK7SgtDPjBTd";
const destGreetingContractAddress = '0xa9cCbB3FC3215109c7c214c8E02EF91fD3FdEfb8';
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
  const destinationChainName = 'TEST1';

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

  await ethereum.sendTransaction(web3, CHAIN_ID, greetingContract, 'sendGreeting', testAccountPrivateKey, [destinationChainName, ['PLATON', 'Greetings', 'Greeting from PLATON', getCurrentDate()]]);
  // let a = await ethereum.contractCall(greetingContract, 'greetings', [3]);
  // let a = await ethereum.contractCall(greetingContract, 'verify', [destinationChainName, contractActionName, destGreetingContractAddress]);
  // let a = await ethereum.contractCall(greetingContract, 'permittedContractMap', [destinationChainName, contractActionName]);
  // let a = await ethereum.contractCall(greetingContract, 'crossChainContract', []);
  // console.log(a)
}());
