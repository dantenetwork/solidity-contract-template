const Web3 = require('web3');
const fs = require('fs');
const ethereum = require('./ethereum');

// const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
const web3 = new Web3('wss://devnetopenapi2.platon.network/ws');
// web3.eth.handleRevert = true;
// const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
// const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/94ebec44ffc34501898dd5dccf387f81');
const crossChainContractAddress = '0x4E6D2E51e153BC2a80c2947AF868e9A1A0789913';
const nearOCContractAddress = 'a7d1736372266477e0d0295d34ae47622ba50d007031a009976348f954e681fe';
const POLKADOT = "5F3Lp5H5bJavW6YYi3aKbYJqdJQHPiNQo4WzujVeXKv9wd5N";
const SHIBUYA = "5D6gvY4fsUsjkQcPnHtxRTy72CxC12RzFzXHknaZDts2sX2T";
const destOSComputingContractAddress = '0xe55eDA7Ab7eCD2ce2c55cdf938488b462F7a5c0A';
const CHAIN_ID = 2203181;

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
  const destinationChainName = 'PLATONEVMDEV';

  // OCComputing contract action name
  const receiveTaskActionName = 'receiveComputeTask';
  const receiveResultActionName = 'receiveComputeTaskCallback';

  // OCComputing contract destination action name
  const destReceiveTaskActionName = '0x47e50a42';
  const destReceiveResultActionName = '0x7fac1127';

  // Set cross chain contract address
  // await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'setCrossChainContract', testAccountPrivateKey, [crossChainContractAddress]);
  // Register contract info for sending messages to other chains
  // await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerDestnContract', testAccountPrivateKey, [receiveTaskActionName, destinationChainName, destOSComputingContractAddress, destReceiveTaskActionName]);
  // await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerDestnContract', testAccountPrivateKey, [receiveResultActionName, destinationChainName, destOSComputingContractAddress, destReceiveResultActionName]);

  // await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'sendComputeTask', testAccountPrivateKey, [destinationChainName, [10,31,30]]);
  let a = await ethereum.contractCall(ocContract, 'ocResult', [1]);
  console.log('a', a);
}());
