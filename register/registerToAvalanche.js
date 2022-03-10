const Web3 = require('web3');
const fs = require('fs');
const avalanche = require('./avalanche');

const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
const crossChainContractAddress = '0x27ED6b8E928Fb7d393EBE4C1ddBc353424a5F3ae';
const nearGreetingContractAddress = 'greeting.near';

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

  // greeting action each param type
  const actionParamsType = 'string,string,string,string';

  // greeting action each param name
  const actionParamsName = 'fromChain,title,content,date';

  // greeting action abi (receiveGreeting)
  const actionABI = '{"inputs":[{"name":"fromChain","type":"string"},{"name":"title","type":"string"},{"name":"content","type":"string"},{"name":"date","type":"string"}],"name":"receiveGreeting","type":"function"}';


  // Set cross chain contract address
  await avalanche.sendTransaction(greetingContract, 'setCrossChainContract', testAccountPrivateKey, [crossChainContractAddress]);

  // Register contract info for sending messages to other chains
  await avalanche.sendTransaction(greetingContract, 'registerDestnContract', testAccountPrivateKey, [destinationChainName, nearGreetingContractAddress, contractActionName]);
  await avalanche.sendTransaction(greetingContract, 'registerMessageABI', testAccountPrivateKey, [contractActionName, actionParamsType, actionParamsName]);

  // Register contract info for receiving messages from other chains.
  await avalanche.sendTransaction(greetingContract, 'registerPermittedContract', testAccountPrivateKey, [destinationChainName, nearGreetingContractAddress, contractActionName]);
  await avalanche.sendTransaction(greetingContract, 'registerContractABI', testAccountPrivateKey, [contractActionName, actionABI]);
}());
