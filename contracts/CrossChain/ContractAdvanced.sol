// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContractBase.sol";

contract ContractAdvanced is ContractBase {
    mapping(bytes32 => string) public dataAbis;

    /**
     * data ABI used to decode data responded by other chain
     * @param _destnChainName - destination chain name
     * @param _destnContractName - destination contract name
     * @param _funcName - destination contract function name
     * @param _dataAbi - data abi
     */
    function registerDataABI(
        string calldata _destnChainName,
        string calldata _destnContractName,
        string calldata _funcName,
        string calldata _dataAbi
    ) external onlyOwner {
        bytes32 hash = keccak256(abi.encodePacked(_destnChainName, _destnContractName, _funcName));
        dataAbis[hash] = _dataAbi;
    }

    /**
     * Get data abi of current message
     */
    function getDataAbi() public view returns (string memory) {
        SimplifiedMessage memory context = getContext();
        require(context.response.resType == 2, "It must be a response message");
        SentMessage memory message = crossChainContract.getSentMessage(context.fromChain, context.response.id);
        bytes32 hash = keccak256(abi.encodePacked(message.toChain, message.content.contractAddress, message.content.action));
        return dataAbis[hash];
    }

    /**
     * Cross chain call
     * @param _destnChainName - destination chain name
     * @param _destnContractName - destination contract name
     * @param _funcName - destination contract function name
     * @param _sqos - security parameters
     * @param _data - cross chain data
     */
    function crossChainCall(string memory _destnChainName, string memory _destnContractName,
        string memory _funcName, SQOS memory _sqos, bytes memory _data) internal {
        crossChainContract.sendMessage(_destnChainName, _destnContractName, _funcName, _sqos, _data, Response(1, 0));
    }

    /**
     * Cross chain respond
     * @param _destnChainName - destination chain name
     * @param _destnContractName - destination contract name
     * @param _funcName - destination contract function name
     * @param _sqos - security parameters
     * @param _data - cross chain data
     */
    function crossChainRespond(string memory _destnChainName, string memory _destnContractName,
        string memory _funcName, SQOS memory _sqos, bytes memory _data) internal {
        SimplifiedMessage memory context = getContext();
        crossChainContract.sendMessage(_destnChainName, _destnContractName, _funcName, _sqos, _data, Response(2, context.id));
    }

    /**
     * Callback function which will deal with responding message
     * @param _data - callback data
     */
    function crossChainCallback(
        bytes calldata _data
    ) virtual public {
        require(
            msg.sender == address(crossChainContract),
            "ContractAdvanced: caller is not CrossChain"
        );
    }
}
