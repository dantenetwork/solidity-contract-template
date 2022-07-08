// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CrossChain/ContractAdvanced.sol";

// `OCComputing` is an example of multi-chain services with necessary implementations in `ContractAdvanced`, which provides basic cross-chain call interfaces.
contract OCComputing is ContractAdvanced {
    // Destination contract info
    struct DestnContract {
        string contractAddress; // destination contract address
        string funcName; // destination contract action name
        bool used;
    }

    struct OCResult {
        bool used;
        uint256 result;
    }

    // Cross-chain destination contract map
    mapping(string => mapping(string => DestnContract)) public destnContractMap;

    // Cross-chain permitted contract map
    mapping(string => mapping(string => string)) public permittedContractMap;

    // Outsourcing computing data cache
    mapping(uint256 => uint256[]) cachedData;
    // Outsourcing computing result
    mapping(string => mapping(uint256 => OCResult)) public ocResult;
    
    /**
     * Send outsourcing computing task to other chain
     * @param _toChain - to chain name
     * @param _nums - nums to be accumulated
     */
    function sendComputeTask(string calldata _toChain, uint32[] calldata _nums) external {
        mapping(string => DestnContract) storage map = destnContractMap[_toChain];
        DestnContract storage destnContract = map["receiveComputeTask"];
        require(destnContract.used, "action not registered");

        // Construct payload
        Payload memory data;
        data.items = new PayloadItem[](1);
        PayloadItem memory item = data.items[0];
        item.name = "nums";
        item.msgType = MsgType.EvmU32Array;
        item.value = abi.encode(_nums);

        SQoS[] memory sqos;
        uint id = crossChainCall(
            _toChain,
            destnContract.contractAddress,
            destnContract.funcName,
            sqos,
            data,
            OCComputing.receiveComputeTaskCallback.selector
        );
        cachedData[id] = _nums;
    }

    /**
     * Receives outsourcing computing task from other chain
     * @param _payload - payload which contains nums to be accumulated
     */
    function receiveComputeTask(Payload calldata _payload) external {
        require(
            msg.sender == address(crossChainContract),
            "Locker: caller is not CrossChain"
        );

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
    }

    /**
     * See IOCComputing
     */
    function receiveComputeTaskCallback(Payload calldata _payload) external {
        require(
            msg.sender == address(crossChainContract),
            "Locker: caller is not CrossChain"
        );

        (uint32 _result) = abi.decode(_payload.items[0].value, (uint32));
        SimplifiedMessage memory context = getContext();
        OCResult storage result = ocResult[context.fromChain][context.session.id];
        result.used = true;
        result.result = _result;
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
        string calldata _contractAddress,
        string calldata _contractFuncName
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
        string calldata _funcName
    ) external onlyOwner {
        mapping(string => string) storage map = permittedContractMap[
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
        string calldata _sender
    ) public view virtual returns (bool) {
        // mapping(string => string) storage map = permittedContractMap[
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
