// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICrossChain.sol";

contract ContractBase is Ownable {
    // Message ABI used to encode/decode messages sent from this contract
    struct MessageABI {
        string parametertypes; // action params' type
        string parameterNames; // action params' name
    }

    // desination contract action mapping
    mapping(string => MessageABI) public messageABIMap;

    // source contract action mapping
    mapping(string => string) public contractABIMap;

    // Dante cross chain contract
    ICrossChain public crossChainContract;

    /**
     * Set cross chain contract
     * @param _address - cross chain contract address
     */
    function setCrossChainContract(address _address) public onlyOwner {
        crossChainContract = ICrossChain(_address);
    }

    ///////////////////////////////////////////////
    /////    Send messages to other chains   //////
    ///////////////////////////////////////////////

    /**
     * message ABI used to encode/decode messages sent from this contract
     * @param _messageName - contract action name
     * @param _paramType - action param types
     * @param _paramName - action param name
     */
    function registerMessageABI(
        string calldata _messageName,
        string calldata _paramType,
        string calldata _paramName
    ) external onlyOwner {
        MessageABI memory info = MessageABI(_paramType, _paramName);
        messageABIMap[_messageName] = info;
    }

    /**
     * Get Registered message ABI to encode/decode message
     * @param _messageName - contract action name
     */
    function getMessageABI(string calldata _messageName)
        external
        view
        returns (MessageABI memory)
    {
        return messageABIMap[_messageName];
    }

    ///////////////////////////////////////////////
    ///    Receive messages from other chains   ///
    ///////////////////////////////////////////////

    /**
     * contract ABI used to encode/decode messages sent to this contract
     * @param _funcName - contract action name
     * @param _contractABI - contract action abi
     */
    function registerContractABI(
        string calldata _funcName,
        string calldata _contractABI
    ) external virtual onlyOwner {
        crossChainContract.registerInterface(_funcName, _contractABI);
    }

    // return context info
    function getContext() public view returns (SimplifiedMessage memory) {
        return crossChainContract.getCurrentMessage();
    }
}
