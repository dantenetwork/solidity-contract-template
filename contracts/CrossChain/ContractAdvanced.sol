// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContractBase.sol";

contract ContractAdvanced is ContractBase {
    /**
     * data ABI used to decode data responded by other chain
     * @param _dataAbi - data abi
     * @param _destnChainName - destination chain name
     * @param _destnContractName - destination contract name
     * @param _funcName - destination contract function name
     */
    function registerDataABI(
        string calldata _dataAbi,
        string calldata _destnChainName,
        string calldata _destnContractName,
        string calldata _funcName
    ) external onlyOwner {
    }

    /**
     * Get data abi of current message
     */
    function getDataAbi() external view returns (MessageABI memory) {
        
    }

    /**
     * Cross chain call
     * @param _destnChainName - destination chain name
     * @param _destnContractName - destination contract name
     * @param _funcName - destination contract function name
     * @param _sqos - security parameters
     * @param _data - cross chain data
     */
    function crossChainCall(string calldata _destnChainName, string calldata _destnContractName,
        string calldata _funcName, SQOS calldata _sqos, bytes calldata _data) internal {
        crossChainContract.sendMessage(_destnChainName, _destnContractName, _funcName, _sqos, _data);
    }

    /**
     * Cross chain respond
     * @param _destnChainName - destination chain name
     * @param _destnContractName - destination contract name
     * @param _funcName - destination contract function name
     * @param _sqos - security parameters
     * @param _data - cross chain data
     */
    function crossChainRespond(string calldata _destnChainName, string calldata _destnContractName,
        string calldata _funcName, SQOS calldata _sqos, bytes calldata _data) internal {
        crossChainContract.sendMessage(_destnChainName, _destnContractName, _funcName, _sqos, _data);
    }

    /**
     * Callback function which will deal with responding message
     * @param _data - callback data
     */
    function crossChainCallback(
        bytes _data
    ) virtual external {
        
    }
}
