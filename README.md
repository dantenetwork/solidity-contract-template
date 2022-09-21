# solidity-contract-template
This repo will show you how to develop a contract in solidity with the feature of cross-chain communication.

## Usage
### Initialize Project
Click `Use this template` to start your multi-ecosystem dApp, and then install
```
npm install
```

Or you can use our SDK in a new solidity project
```
npm install @hthuang/contracts
```

### Use SDK
Add the following code into your `.sol` file
```
import "@hthuang/contracts/interfaces/ICrossChain.sol";
```

Then you can use the interface of underlying cross-chain contract and message structures.

### Cross-chain contract address
```
0x2999fe13d3CAa63C0bC523E8D5b19A265637dbd2
```
The cross-chain contract address is configured [here](./config/default.json)

## Specification
The SDK provides users with two base contracts, which have some basic methods to finish cross-chain communication.

### ContractBase
Located at `CrossChain/ContractBase.sol`.

**setCrossChainContract**
This method can set custom cross-chain contract address.
```
function setCrossChainContract(address _address) public onlyOwner {
    crossChainContract = ICrossChain(_address);
}
```

**getContext**
This method can return the context which containing neccessay information of current cross-chain message.
```
function getContext() public view returns (SimplifiedMessage memory) {
    return crossChainContract.getCurrentMessage();
}
```

### ContractAdvanced
Located at `CrossChain/ContractAdvanced.sol`.

**crossChainCall**
This method can send a cross-chain call to a contract on another chain with a callback handler.
```
function crossChainCall(string memory _destnChainName, string memory _destnContractName,
    string memory _funcName, SQoS[] memory _sqos, Payload memory _data, bytes4 _callback) internal returns (uint256) {
    ISentMessage memory message;
    message.toChain = _destnChainName;
    message.sqos = _sqos;
    message.session = Session(0, bytes.concat(_callback));
    message.content = Content(_destnContractName, _funcName, _data);
    return crossChainContract.sendMessage(message);
}
```

**crossChainRespond**
This method can call a callback to then contract of the source chain.
```
function crossChainRespond(SQoS[] memory _sqos, Payload memory _data) internal returns (uint256) {
    SimplifiedMessage memory context = getContext();
    ISentMessage memory message;
    message.toChain = context.fromChain;
    message.sqos = _sqos;
    message.session = Session(context.id, "");
    message.content = Content(context.sender, string(context.session.callback), _data);
    return crossChainContract.sendMessage(message);
}
```

## Examples
There are two examples:
- Greetings.sol: Implements `ContractBase`, shows sending a greeting message from evm-compatible chain to other chains.
- OCComputing.sol: Implements `ContractAdvanced`, shows sending a outsourcing computing task to other chains, and receive results.

### Dependencies
* SDK
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
