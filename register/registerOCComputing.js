const Web3 = require('web3');
const fs = require('fs');
const ethereum = require('./ethereum');
const { program } = require('commander');
const config = require('config');

let web3;
let netConfig;
let contract;

const ABI_PATH = './build/contracts/OCComputing.json';
const CONTRACT_KEY_NAME = 'computingContractAddress';
const METHOD_KEY_NAME = 'receiveComputeTask';

// Private key
let testAccountPrivateKey = fs.readFileSync('./.secret').toString();

function init(chainName) {
    netConfig = config.get(chainName);
    if (!netConfig) {
        console.log('Config of chain (' + chainName + ') not exists');
        return false;
    }

    // Load contract abi, and init contract object
    const contractRawData = fs.readFileSync(ABI_PATH);
    const contractAbi = JSON.parse(contractRawData).abi;

    web3 = new Web3(netConfig.nodeAddress);
    web3.eth.handleRevert = true;
    contract = new web3.eth.Contract(contractAbi, netConfig[CONTRACT_KEY_NAME]);

    return true;
}

async function initialize() {
  // Set cross chain contract address
  await ethereum.sendTransaction(web3, netConfig.chainId, contract, 'setCrossChainContract', testAccountPrivateKey, [netConfig.crossChainContractAddress]);
}

async function registerDestnContract(chainName) {
  let destConfig = config.get(chainName);
  if (!destConfig) {
      console.log('Config of dest chain (' + chainName + ') not exists');
      return false;
  }

  const interface = JSON.parse(fs.readFileSync('./config/interface.json'));
  if (!interface[destConfig.interface]) {
    console.log('Interface of dest chain (' + chainName + ') not exists');
    return false;
  }

  // Register contract info for sending messages to other chains
  await ethereum.sendTransaction(web3, netConfig.chainId, contract, 'registerDestnContract',testAccountPrivateKey,
    [METHOD_KEY_NAME, chainName, destConfig[CONTRACT_KEY_NAME], interface[destConfig.interface][METHOD_KEY_NAME]]);
}

async function sendComputingTask(toChain, nums) {
  await ethereum.sendTransaction(web3, netConfig.chainId, contract, 'sendComputeTask', testAccountPrivateKey,
    [toChain, nums]);
}

async function getOCResult(chainName) {
  return await ethereum.contractCall(contract, 'getResults', [chainName]);
}

async function transfer(address) {
  await ethereum.sendTransaction(web3, netConfig.chainId, contract, 'transferOwnership', testAccountPrivateKey, [address]);
}

async function clear(chainName) {
  await ethereum.sendTransaction(web3, netConfig.chainId, contract, 'clear', testAccountPrivateKey, [chainName]);
}

(async function () {
  function list(val) {
    return val.split(',')
  }

  program
      .version('0.1.0')
      .option('-i, --initialize <chain name>', 'Initialize greeting contract')
      .option('-r, --register <chain name>,<dest chain name>', 'Register destination chain contract', list)
      .option('-s, --send <chain name>,<dest chain name>,<num list>', 'Send greeting message', list)
      .option('-g, --get <chain name>,<dest chain name>,<id>', 'Get computing result', list)
      .option('-t, --transfer <chain name>,<address>', 'Transfer ownership', list)
      .option('-c, --clear <chain name>,<dest chain name>', 'Clear messages from destination chain contract', list)
      .parse(process.argv);

  if (program.opts().initialize) {
      if (!init(program.opts().initialize)) {
          return;
      }
      await initialize();
  }
  else if (program.opts().register) {
      if (program.opts().register.length != 2) {
          console.log('2 arguments are needed, but ' + program.opts().register.length + ' provided');
          return;
      }
      
      if (!init(program.opts().register[0])) {
          return;
      }
      await registerDestnContract(program.opts().register[1]);
  }
  else if (program.opts().send) {
    if (program.opts().send.length != 3) {
        console.log('3 arguments are needed, but ' + program.opts().send.length + ' provided');
        return;
    }

    if (!init(program.opts().send[0])) {
        return;
    }

    let nums = program.opts().send[2].split('|');
    await sendComputingTask(program.opts().send[1], nums);
  }
  else if (program.opts().get) {
    if (program.opts().get.length != 2) {
        console.log('2 arguments are needed, but ' + program.opts().get.length + ' provided');
        return;
    }

    if (!init(program.opts().get[0])) {
        return;
    }
    let result = await getOCResult(program.opts().get[1]);
    console.log('result', result);
  }
  else if (program.opts().transfer) {
      if (program.opts().transfer.length != 2) {
          console.log('2 arguments are needed, but ' + program.opts().transfer.length + ' provided');
          return;
      }
      
      if (!init(program.opts().transfer[0])) {
          return;
      }
      await transfer(program.opts().transfer[1]);
  }
  else if (program.opts().clear) {
      if (program.opts().clear.length != 2) {
          console.log('2 arguments are needed, but ' + program.opts().clear.length + ' provided');
          return;
      }
      
      if (!init(program.opts().clear[0])) {
          return;
      }
      await clear(program.opts().clear[1]);
  }
}());
