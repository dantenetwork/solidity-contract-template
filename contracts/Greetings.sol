// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CrossChain/ContractBase.sol";

uint256 constant CALLER_NOT_CROSS_CHAIN_CONTRACT = 100;

// `Greetings` is an example of multi-chain services with necessary implementations in `ContractBase`, without which the user defined contract cannot work.
// And besides, `registerDestnContract` and `registerPermittedContract` are templete implementations make the management of some user defined informations easier.
contract Greetings is ContractBase {
    // Destination contract info
    struct DestnContract {
        bytes contractAddress; // destination contract address
        bytes funcName; // destination contract action name
        bool used;
    }

    // greeting
    struct Greeting {
        string fromChain;
        string title;
        string content;
        string date;
    }

    // Cross-chain destination contract map
    mapping(string => mapping(string => DestnContract)) public destnContractMap;

    // Cross-chain permitted contract map
    mapping(string => mapping(bytes4 => string)) public permittedContractMap;

    // Store greetings
    mapping(string => mapping(uint256 => Greeting)) public greetings;

    /**
     * Receive greeting info from other chains
     * @param _payload - payload which contains greeting message
     */
    function receiveGreeting(Payload calldata _payload) public returns (uint256) {
        if (msg.sender != address(crossChainContract)) {
            return CALLER_NOT_CROSS_CHAIN_CONTRACT;
        }

        // `context` used for verify the operation authority
        SimplifiedMessage memory context = getContext();
        // verify sqos
        // require(context.sqos.reveal == 1, "SQoS invalid!");

        (string[] memory _value) = abi.decode(_payload.items[0].value, (string[]));
        Greeting memory _greeting = Greeting(_value[0], _value[1], _value[2], _value[3]);
        greetings[context.fromChain][context.id] = _greeting;

        return 0;
    }

    /**
     * Send greeting info to other chains
     * @param _toChain - to chain name
     * @param _greeting - greeting sent to other chain
     */
    function sendGreeting(
        string calldata _toChain,
        string[] calldata _greeting
    ) external {
        mapping(string => DestnContract) storage map = destnContractMap[_toChain];
        DestnContract storage destnContract = map["receiveGreeting"];
        require(destnContract.used, "action not registered");

        // Construct payload
        Payload memory data;
        data.items = new PayloadItem[](1);
        PayloadItem memory item = data.items[0];
        item.name = "greeting";
        item.msgType = MsgType.EvmStringArray;
        item.value = abi.encode(_greeting);

        ISentMessage memory message;
        message.toChain = _toChain;
        message.session = Session(0, 0, "", "", "");
        message.content = Content(destnContract.contractAddress, destnContract.funcName, data);

        crossChainContract.sendMessage(message);
    }

    ///////////////////////////////////////////////
    /////    Send messages to other chains   //////
    ///////////////////////////////////////////////

    /**
     * Register destination contract info
     * @param _funcName - function name to be called
     * @param _toChain - destination chain name
     * @param _contractAddress - destination contract address
     * @param _contractFuncName - contract function name
     */
    function registerDestnContract(
        string calldata _funcName,
        string calldata _toChain,
        bytes calldata _contractAddress,
        bytes calldata _contractFuncName
    ) external onlyOwner {
        mapping(string => DestnContract) storage map = destnContractMap[_toChain];
        DestnContract storage destnContract = map[_funcName];
        destnContract.contractAddress = _contractAddress;
        destnContract.funcName = _contractFuncName;
        destnContract.used = true;
    }

    ///////////////////////////////////////////////
    ///    Receive messages from other chains   ///
    ///////////////////////////////////////////////

    /**
     * Authorize contracts of other chains to call the functions of this contract
     * @param _chainName - from chain name
     * @param _sender - sender of cross chain message
     * @param _funcName - action name which allowed to be invoked
     */
    function registerPermittedContract(
        string calldata _chainName,
        string calldata _sender,
        bytes4 _funcName
    ) external onlyOwner {
        mapping(bytes4 => string) storage map = permittedContractMap[
            _chainName
        ];
        map[_funcName] = _sender;
    }

    /**
     * This verify method will be invoked by the CrossChain contract automatically, ensure that only registered contract(registerSourceContract) calls are allowed
     * @param _chainName - chain name of cross chain message
     * @param _funcName - contract action name of cross chain message
     * @param _sender - cross chain message sender
     */
    //  Will be deprecated soon
    function verify(
        string calldata _chainName,
        bytes4 _funcName,
        bytes calldata _sender
    ) public view virtual returns (bool) {
        // mapping(bytes4 => string) storage map = permittedContractMap[
        //     _chainName
        // ];
        // string storage sender = map[_funcName];
        // require(
        //     keccak256(bytes(sender)) == keccak256(bytes(_sender)),
        //     "Sender does not match"
        // );
        return true;
    }
}
