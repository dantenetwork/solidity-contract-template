const Web3 = require('web3');
const fs = require('fs');
const avalanche = require('./avalanche');

// const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
const web3 = new Web3('wss://devnetopenapi2.platon.network/ws');
const crossChainContractAddress = '0x4cd5F0963bbd6Ee2624505878b0C436C9a7d1aE3';
const nearGreetingContractAddress = '9f9350eb575cae7aac7f85a8c62b08d94dcac70a84e3c765464ff87c669fa4e5';
const CHAIN_ID = 2203181;

// Test account
let testAccountPrivateKey = fs.readFileSync('.secret').toString();

// Greeting smart contract address
const address = fs.readFileSync('./build/address.json');
const avalancheGreetingContractAddress = JSON.parse(address).greetingsContractAddress;

// Load contract abi, and init greeting contract object
const greetingRawData = fs.readFileSync('./build/contracts/Greetings.json');
const greetingAbi = JSON.parse(greetingRawData).abi;
const greetingContract = new web3.eth.Contract(greetingAbi, avalancheGreetingContractAddress);

(async function init() {
  // destination chain name
  const destinationChainName = 'NEAR';

  // greeting contract action name
  const contractActionName = 'receiveGreeting';

  // greeting contract destination action name
  const destContractActionName = 'receive_greeting';

  // greeting action each param type
  const actionParamsType = 'tuple(string,string,string,string)';

  // greeting action each param name
  const actionParamsName = 'greeting';

  // greeting action abi (receiveGreeting)
  const actionABI = '{"inputs":[{"components":[{"internalType":"string","name":"fromChain","type":"string"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"content","type":"string"},{"internalType":"string","name":"date","type":"string"}],"internalType":"struct Greetings.Greeting","name":"_greeting","type":"tuple"}],"name":"receiveGreeting","outputs":[],"stateMutability":"nonpayable","type":"function"}';


  // Set cross chain contract address
  await avalanche.sendTransaction(web3, CHAIN_ID, greetingContract, 'setCrossChainContract', testAccountPrivateKey, [crossChainContractAddress]);
  // Register contract info for sending messages to other chains
  await avalanche.sendTransaction(web3, CHAIN_ID, greetingContract, 'registerDestnContract', testAccountPrivateKey, [contractActionName, destinationChainName, nearGreetingContractAddress, destContractActionName]);
  await avalanche.sendTransaction(web3, CHAIN_ID, greetingContract, 'registerMessageABI', testAccountPrivateKey, [destinationChainName, nearGreetingContractAddress, destContractActionName, actionParamsType, actionParamsName]);

  // Register contract info for receiving messages from other chains.
  await avalanche.sendTransaction(web3, CHAIN_ID, greetingContract, 'registerPermittedContract', testAccountPrivateKey, [destinationChainName, nearGreetingContractAddress, contractActionName]);
  await avalanche.sendTransaction(web3, CHAIN_ID, greetingContract, 'registerContractABI', testAccountPrivateKey, [contractActionName, actionABI]);
}());
