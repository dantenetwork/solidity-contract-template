const Web3 = require('web3');
const fs = require('fs');
const ethereum = require('./ethereum');

// const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
const web3 = new Web3('wss://devnetopenapi2.platon.network/ws');
// web3.eth.handleRevert = true;
// const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
// const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/94ebec44ffc34501898dd5dccf387f81');
const crossChainContractAddress = '0x1A5D61971AaAC09Fa916e080aAab41cb5C02c1c1';
const nearOCContractAddress = 'a7d1736372266477e0d0295d34ae47622ba50d007031a009976348f954e681fe';
const POLKADOT = "5F3Lp5H5bJavW6YYi3aKbYJqdJQHPiNQo4WzujVeXKv9wd5N";
const SHIBUYA = "5D6gvY4fsUsjkQcPnHtxRTy72CxC12RzFzXHknaZDts2sX2T";
const destOSComputingContractAddress = '0x4ca3e1B18829DE369fe2862F3712E81c77cdaDCb';
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
  const destReceiveTaskActionName = '0x1db89088';
  const destReceiveResultActionName = '0xdb1b3c7f';

  // Set cross chain contract address
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'setCrossChainContract', testAccountPrivateKey, [crossChainContractAddress]);
  // Register contract info for sending messages to other chains
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerDestnContract', testAccountPrivateKey, [receiveTaskActionName, destinationChainName, destOSComputingContractAddress, destReceiveTaskActionName]);
  await ethereum.sendTransaction(web3, CHAIN_ID, ocContract, 'registerDestnContract', testAccountPrivateKey, [receiveResultActionName, destinationChainName, destOSComputingContractAddress, destReceiveResultActionName]);
}());
