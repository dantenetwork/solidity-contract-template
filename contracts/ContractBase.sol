// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CrossChain/CrossChain.sol";

contract ConsumerBase is Ownable {
    struct DestinationMethod {
        string contractAddress;
        string methodName;
        bool used;
    }

    // Dante cross chain contract
    CrossChain public crossChainContract;
    // Cross-chain method map
    mapping(string => DestinationMethod) public methodMap;
    // Cross-chain source sender map
    mapping(string => mapping(string => string)) public senderMap;

    /**
     * Set cross chain contract
     * @param _address - cross chain contract address
     */
    function setCrossChainContract(address _address) public onlyOwner {
        crossChainContract = CrossChain(_address);
    }

    ///////////////////////////////////////////////
    /////    Send messages to other chains   //////
    ///////////////////////////////////////////////

    /**
     * Register destination contract info
     * @param _toChain - destination chain name
     * @param _contractAddress - contract address
     * @param _methodName - contract action bane
     */
    function registerDestinationChain(
        string calldata _toChain,
        string calldata _contractAddress,
        string calldata _methodName
    ) external onlyOwner {
        DestinationMethod storage method = methodMap[_toChain];
        method.contractAddress = _contractAddress;
        method.methodName = _methodName;
        method.used = true;
    }

    /**
     * Register action info for send message
     * @param _funcName - contract action name
     * @param _paramType - action param types
     * @param _paramName - action param name
     */
    function registerDestinationAction(
        string calldata _funcName,
        string calldata _paramType,
        string calldata _paramName
    ) external onlyOwner {
        crossChainContract.registerTarget(
            _funcName,
            _paramType,
            _paramName,
            ""
        );
    }

    ///////////////////////////////////////////////
    ///    Receive messages from other chains   ///
    ///////////////////////////////////////////////

    /**
     * Authorize contracts of other chains to call the functions of this contract
     * @param _chainName - from chain name
     * @param _sender - sender of cross chain message
     * @param _methodName - action name which allowed to be invoked
     */
    function registerSourceChain(
        string calldata _chainName,
        string calldata _sender,
        string calldata _methodName
    ) external onlyOwner {
        mapping(string => string) storage map = senderMap[_chainName];
        map[_methodName] = _sender;
    }

    /**
     * Register action info for receive message
     * @param _funcName - contract action name
     * @param _interface - contract action abi
     */
    function registerSourceAction(
        string calldata _funcName,
        string calldata _interface
    ) external virtual onlyOwner {
        crossChainContract.registerInterface(_funcName, _interface);
    }

    /**
     * This verify method which will be invoked by the CrossChain contract automatically, ensure that only registered contract(registerSourceSender) calls are allowed
     * @param _chainName - chain name of cross chain message
     * @param _methodName - contract action name of cross chain message
     * @param _sender - cross chain message sender
     */
    function verify(
        string calldata _chainName,
        string calldata _methodName,
        string calldata _sender
    ) public view virtual returns (bool) {
        mapping(string => string) storage map = senderMap[_chainName];
        string storage sender = map[_methodName];
        require(
            keccak256(bytes(sender)) == keccak256(bytes(_sender)),
            "Sender does not match"
        );
        return true;
    }
}
