const Web3 = require('web3');
const fs = require('fs');
const ethereum = require('./ethereum');

const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
// const web3 = new Web3('wss://devnetopenapi2.platon.network/ws');
// const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
const crossChainContractAddress = '0xc17a00D5e657fd8E5766A4E1C13599ea4d31E563';
const destGreetingContractAddress = '0x533db5453F0fc9791f08d052EE1903BE45b1A07d';
const CHAIN_ID = 43113;

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
  const destContractActionName = 'receiveGreeting';

  // greeting action each param type
  const actionParamsType = 'tuple(string,string,string,string,string)';

  // greeting action each param name
  const actionParamsName = 'greeting';

  // greeting action abi (receiveGreeting)
  const actionABI = '{"inputs":[{"components":[{"internalType":"string","name":"fromChain","type":"string"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"content","type":"string"},{"internalType":"string","name":"date","type":"string"},{"internalType":"string","name":"extra","type":"string"}],"internalType":"struct Greetings.Greeting","name":"_greeting","type":"tuple"}],"name":"receiveGreeting","outputs":[],"stateMutability":"nonpayable","type":"function"}';

  // Get current date
  function getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    return yyyy + '-' + mm + '-' + dd;
  }

  // Set cross chain contract address
  await ethereum.sendTransaction(web3, CHAIN_ID, greetingContract, 'setCrossChainContract', testAccountPrivateKey, [crossChainContractAddress]);
  // Register contract info for sending messages to other chains
  await ethereum.sendTransaction(web3, CHAIN_ID, greetingContract, 'registerDestnContract', testAccountPrivateKey, [contractActionName, destinationChainName, destGreetingContractAddress, destContractActionName]);
  await ethereum.sendTransaction(web3, CHAIN_ID, greetingContract, 'registerMessageABI', testAccountPrivateKey, [destinationChainName, destGreetingContractAddress, destContractActionName, actionParamsType, actionParamsName]);

  // Register contract info for receiving messages from other chains.
  await ethereum.sendTransaction(web3, CHAIN_ID, greetingContract, 'registerPermittedContract', testAccountPrivateKey, [destinationChainName, destGreetingContractAddress, contractActionName]);
  await ethereum.sendTransaction(web3, CHAIN_ID, greetingContract, 'registerContractABI', testAccountPrivateKey, [contractActionName, actionABI]);
}());
