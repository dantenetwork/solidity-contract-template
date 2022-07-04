# solidity-contract-template

## Currently
**This is under construction!**

This repo contains a basic `greeting` smart contract integrated with DANTE cross-chain service.

The basic version developed in `solidity` is currently available.

## Coming soon
- More functions in `solidity` version;
- The high level SDK for `cross-chain contract call` is under developing, that will bring more convenient for developers.
- The `Near Rust-wasm` version.

## Usage

Dependencies:
* @dante-contracts
* [@openzeppelin-contracts v4.4.2](https://github.com/OpenZeppelin/openzeppelin-contracts)
* [@truffle/hdwallet-provider v2.0.0](https://www.npmjs.com/package/@truffle/hdwallet-provider)

### Install
```
npm install -g truffle
npm install -d
```

### Prepare secret key file
Paste your private key string into file `.secret`, and ensure there is enough tokens for deploy contracts.

### Compile smart contract
```
truffle compile
```

### Deploy smart contract
```
truffle migrate --network <NETWORK> --reset --skip-dry-run
```

`<NETWORK>` is the name of network configured in `truffle-config.js`.  
There are some default configuration of networks, you can and other networks.

### Register
After deploying contracts, you must register some information before using them. There are two things needed to be done in the registration, one is registering the cross-chain contract address, the other one is registering the contract address and the method name of destination chain with which the deployed contracts communicate.

#### Configuration
**config/default.json**
General configs of networks.

- **nodeAddress**: rpc/ws address of a node.
- **chainId**: Chain id of the chain.
- **crossChainContractAddress**: Address of the cross-chain contract deployed on the chain.
- **greetingContractAddress**: Address of greeting contract, which will be filled automatically after migrating.
- **computingContractAddress**: Address of computing contract, which will be filled automatically after migrating.
- **interface**: Index of the interface in `config/interface.json` to indicate interface info.

If the network is not EVM-compatible, *nodeAddress*, *chainId*, *crossChainContractAddress* do not need to be filled.

**config/interface.json**
Interface information of contracts.

- **receiveGreeting**: Interface name of `receiveGreeting`.
- **receiveComputingTask**: Interface name of `receiveComputingTask`.
- **receiveComputeTaskCallback**: Interface name of `receiveComputeTaskCallback`.

The key should be the same as used in the solidity code.  
The value is a hex string of 4 bytes value in EVM-compatible chains.

#### Execute
**Greeting**
```
// Initialize
node register/registerGreeting.js -i <CHAIN_NAME>
// Register destination chain
node register/registerGreeting.js -r <FROM_CHAIN>,<TO_CHAIN>
```

And you can also use the commands below to test your contracts
```
// Send greeting
node register/registerGreeting.js -s <FROM_CHAIN>,<TO_CHAIN>
// Get greeting
node register/registerGreeting.js -s <CHAIN_NAME>,<ID>
```

`<CHAIN_NAME>`, `<FROM_CHAIN>`, `<TO_CHAIN>` are chain names.  
`<ID>` is the key to index the greeting message.

**OCComputing**
```
// Initialize
node register/registerOCComputing.js -i <CHAIN_NAME>
// Register destination chain
node register/registerOCComputing.js -r <FROM_CHAIN>,<TO_CHAIN>
```

And you can also use the commands below to test your contracts
```
// Send greeting
node register/registerOCComputing.js -s <FROM_CHAIN>,<TO_CHAIN>,<NUM_LIST>
// Get greeting
node register/registerOCComputing.js -s <CHAIN_NAME>,<ID>
```

`<CHAIN_NAME>`, `<FROM_CHAIN>`, `<TO_CHAIN>` are chain names.  
`<ID>` is the key to index the greeting message.
`<NUM_LIST>` is the list of numbers to be computed, the string is seperated by '|', such as "3|5|6"
