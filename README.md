# solidity-contract-template
This repo will show you how to develop a contract in solidity with the feature of cross-chain communication.

## Usage
### Initialize Project
#### Use the Template
Click `Use this template` to start your multi-ecosystem dApp, and then install
```
npm install
```

Both examples `Greetings.sol` and `OCComputing.sol`, which will be specified later, can be used as templates.

#### Use SDK directly
You can also use our SDK in a **new solidity project**
```
mkdir <PROJECT_NAME> && cd <PROJECT_NAME>
truffle init
npm init -y
npm install @hthuang/contracts
```

Add the following code into your `.sol` file
```
import "@hthuang/contracts/ContractAdvanced.sol";
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
Located at [CrossChain/ContractAdvanced.sol](./contracts/CrossChain/ContractAdvanced.sol).

**[crossChainCall](./contracts/CrossChain/ContractAdvanced.sol#L22)**  
This method can send a cross-chain call to a contract on another chain with a callback handler.

**[crossChainRespond](./contracts/CrossChain/ContractAdvanced.sol#L41)**  
This method can send a result back to the contract of the source chain.


### Dev Example
The usage of the two above API can be found at [OCComputing.sol](./contracts/OCComputing.sol), and the key points are as follow:
* Call out and get call-back  
[call out](./contracts/OCComputing.sol#L39)
```solidity
// --snip--
// Construct payload
    Payload memory data;
    data.items = new PayloadItem[](1);
    PayloadItem memory item = data.items[0];
    item.name = "nums";
    item.msgType = MsgType.EvmU32Array;
    item.value = abi.encode(_nums);

    SQoS[] memory sqos;
    uint256 id = crossChainCall(
        _toChain,
        destnContract.contractAddress,
        destnContract.funcName,
        sqos,
        data,
        OCComputing.receiveComputeTaskCallback.selector
    );
// --snip--
```
[OCComputing.receiveComputeTaskCallback.selector](./contracts/OCComputing.sol#L121) is the callback function to receive the response.

```solidity
// --snip--
    (uint32 _result) = abi.decode(_payload.items[0].value, (uint32));
    SimplifiedMessage memory context = getContext();
    uint256 index = 0;
    bool found = false;
    for (uint256 i = 0; i < ocResult[context.fromChain].length; i++) {
        if (ocResult[context.fromChain][i].session == context.session.id) {
            found = true;
            index = i;
            break;
        }
    }

// --snip--
```
`getContext()` provides a context of this response, including `context.session.id` related to the previous call.

* [Receive remote invocation and response to it](./contracts/OCComputing.sol#L75)  

```solidity
// --snip--
    // decode
    (uint32[] memory _nums) = abi.decode(_payload.items[0].value, (uint32[]));
    
    // compute
    uint ret = 0;
    for (uint i = 0; i < _nums.length; i++) {
        ret += _nums[i];
    }

    // Construct payload
    Payload memory data;
    data.items = new PayloadItem[](1);
    PayloadItem memory item = data.items[0];
    item.name = "result";
    item.msgType = MsgType.EvmU32;
    item.value = abi.encode(ret);

    SQoS[] memory sqos;
    crossChainRespond(sqos, data);
// --snip--
```
The result is setted into a `Payload`, and `crossChainRespond` helps send the response out.

### Related Date Structure
* Payload
`Payload` is the message load can be understood among different tech stacks, the defination of which is as below:
```solidity
enum MsgType {
    EvmString,
    EvmU8,
    EvmU16,
    EvmU32,
    EvmU64,
    EvmU128,
    EvmI8,
    EvmI16,
    EvmI32,
    EvmI64,
    EvmI128,
    EvmStringArray,
    EvmU8Array,
    EvmU16Array,
    EvmU32Array,
    EvmU64Array,
    EvmU128Array,
    EvmI8Array,
    EvmI16Array,
    EvmI32Array,
    EvmI64Array,
    EvmI128Array
}

struct PayloadItem {
    string name;
    MsgType msgType;
    bytes value;
}

struct Payload {
    PayloadItem[] items;
}
```

* SQoS  
`SQoS` is the security demand of an invocation.
```solidity
enum SQoSType {
    Reveal,
    Challenge,
    Threshold,
    Priority,
    ExceptionRollback,
    SelectionDelay,
    Anonymous,
    Identity,
    Isolation,
    CrossVerify
}

struct SQoS {
    SQoSType t;
    bytes v;
}
```

* session  
`session` provides a relationship between call-out and call-back, as the invocations between different chains are asynchronous.
```solidity
struct Session {
    // 0: request message
    // > 0: response message
    uint256 id;
    uint8 sessionType;
    bytes callback;
    bytes commitment;
    bytes answer;
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
