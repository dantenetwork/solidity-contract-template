const Web3 = require('web3');
const fs = require('fs');
const ethereum = require('./ethereum');

// const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
// const web3 = new Web3('wss://devnetopenapi2.platon.network/ws');
// web3.eth.handleRevert = true;
// const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/94ebec44ffc34501898dd5dccf387f81');
const crossChainContractAddress = '0x359d5510405093f7Ea15408a0A3F52c52730A77e';
const nearOCContractAddress = 'a7d1736372266477e0d0295d34ae47622ba50d007031a009976348f954e681fe';
const POLKADOT = "5F3Lp5H5bJavW6YYi3aKbYJqdJQHPiNQo4WzujVeXKv9wd5N";
const SHIBUYA = "5D6gvY4fsUsjkQcPnHtxRTy72CxC12RzFzXHknaZDts2sX2T";
const destOSComputingContractAddress = SHIBUYA;
const CHAIN_ID = 4;

// Test account
let testAccountPrivateKey = fs.readFileSync('.secret').toString();

// OC smart contract address
const address = fs.readFileSync('./build/oc.json');
const contractAddress = JSON.parse(address).OCContractAddress;

// Load contract abi, and init oc contract object
const ocRawData = fs.readFileSync('./build/contracts/OCComputing.json');
const ocAbi = JSON.parse(ocRawData).abi;
const ocContract = new web3.eth.Contract(ocAbi, contractAddress);

(async function init() {
  // destination chain name
  const destinationChainName = 'ASTAR';

  // OCComputing contract action name
  const receiveTaskActionName = 'receiveComputeTask';
  const receiveResultActionName = 'receiveComputeTaskCallback';

  // OCComputing contract destination action name
  const destReceiveTaskActionName = '0xfc796c19';
  const destReceiveResultActionName = '0x609ec10e';

  // OCComputing action each param type
  const receiveTaskParamsType = 'uint32[]';
  const receiveResultParamsType = 'uint32';

  // OCComputing action each param name
  const receiveTaskParamsName = 'nums';
  const receiveResultParamsName = 'result';

  // OCComputing action abi
  const receiveTaskABI = '{"inputs":[{"internalType":"uint256[]","name":"_nums","type":"uint32[]"}],"name":"receiveComputeTask","outputs":[],"stateMutability":"nonpayable","type":"function"}';

  // OCComputing callback abi
  const receiveResultABI = '{"inputs":[{"internalType":"uint256","name":"_result","type":"uint256"}],"name":"receiveComputeTaskCallback","outputs":[],"stateMutability":"nonpayable","type":"function"}';

  // Set cross chain contract address
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'setCrossChainContract', testAccountPrivateKey, [crossChainContractAddress]);
  // Register contract info for sending messages to other chains
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerDestnContract', testAccountPrivateKey, [receiveTaskActionName, destinationChainName, destOSComputingContractAddress, destReceiveTaskActionName]);
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerDestnContract', testAccountPrivateKey, [receiveResultActionName, destinationChainName, destOSComputingContractAddress, destReceiveResultActionName]);
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerMessageABI', testAccountPrivateKey, [destinationChainName, destOSComputingContractAddress, destReceiveTaskActionName, receiveTaskParamsType, receiveTaskParamsName]);
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerMessageABI', testAccountPrivateKey, [destinationChainName, destOSComputingContractAddress, destReceiveResultActionName, receiveResultParamsType, receiveResultParamsName]);

  // Register contract info for receiving messages from other chains.
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerPermittedContract', testAccountPrivateKey, [destinationChainName, destOSComputingContractAddress, receiveTaskActionName]);
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerPermittedContract', testAccountPrivateKey, [destinationChainName, destOSComputingContractAddress, receiveResultActionName]);
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerContractABI', testAccountPrivateKey, [receiveTaskActionName, receiveTaskABI]);
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerCallbackAbi', testAccountPrivateKey, [destinationChainName, destOSComputingContractAddress, destReceiveTaskActionName, receiveResultABI]);
}());
