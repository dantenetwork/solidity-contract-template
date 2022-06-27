const Web3 = require('web3');
const fs = require('fs');
const ethereum = require('./ethereum');

/*
Test1:
Greeting: 0x621e1dFfa7c9eE402AcEd93Ceb00b737987e8604
Computing: 0x457df1a8B1a2E67a413FCDE50782D031fA128BAA
PlatON:
Greeting: 0xb752F7f634d6d02F8DbD200d26C1bC667654d21a
Computing: 0x4ca3e1B18829DE369fe2862F3712E81c77cdaDCb
*/

// const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
const web3 = new Web3('wss://devnetopenapi2.platon.network/ws');
// const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
// const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/94ebec44ffc34501898dd5dccf387f81');
const crossChainContractAddress = '0x1A5D61971AaAC09Fa916e080aAab41cb5C02c1c1';
const nearGreetingContractAddress = '9f9350eb575cae7aac7f85a8c62b08d94dcac70a84e3c765464ff87c669fa4e5';
// const POLKADOT = "5CBD313ffFKkibotMZGMJpFpFshL237Lfv1rrsoj5qGrgQTz";
const SHIBUYA = "5CqHgtxcuqhng95pxXvS25hBCPXNv9wKhvSktK7SgtDPjBTd";
const destGreetingContractAddress = '0xb752F7f634d6d02F8DbD200d26C1bC667654d21a';
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
  const destContractActionName = '0xcc9beeb9';

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
