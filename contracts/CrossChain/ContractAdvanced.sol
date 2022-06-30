// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContractBase.sol";

contract ContractAdvanced is ContractBase {
    mapping(bytes32 => string) public callbackAbis;

    /**
     * Callback ABI used to decode data responded by other chain
     * @param _destnChainName - destination chain name
     * @param _destnContractName - destination contract name
     * @param _funcName - destination contract function name
     * @param _callbackAbi - data abi
     */
    function registerCallbackAbi(
        string calldata _destnChainName,
        string calldata _destnContractName,
        string calldata _funcName,
        string calldata _callbackAbi
    ) external onlyOwner {
        bytes32 hash = keccak256(abi.encodePacked(_destnChainName, _destnContractName, _funcName));
        callbackAbis[hash] = _callbackAbi;
    }

    ///////////////////////////////////////////////
    /////  Cross-chain call to other chains  //////
    ///////////////////////////////////////////////

    /**
     * Cross chain call
     * @param _destnChainName - destination chain name
     * @param _destnContractName - destination contract name
     * @param _funcName - destination contract function name
     * @param _sqos - security parameters
     * @param _data - cross chain data
     * @param _callback - selector of callback method
     */
    function crossChainCall(string memory _destnChainName, string memory _destnContractName,
        string memory _funcName, SQOS memory _sqos, Payload memory _data, bytes4 _callback) internal returns (uint256) {
        ISentMessage memory message;
        message.toChain = _destnChainName;
        message.sqos = _sqos;
        message.session = Session(0, bytes.concat(_callback));
        message.content = Content(_destnContractName, _funcName, _data);
        return crossChainContract.sendMessage(message);
    }

    ///////////////////////////////////////////////
    ///// Cross-chain respond to other chains//////
    ///////////////////////////////////////////////

    /**
     * Cross chain respond
     * @param _funcName - destination contract function name
     * @param _sqos - security parameters
     * @param _data - cross chain data
     */
    function crossChainRespond(string memory _funcName, SQOS memory _sqos, Payload memory _data) internal returns (uint256) {
        SimplifiedMessage memory context = getContext();
        ISentMessage memory message;
        message.toChain = context.fromChain;
        message.sqos = _sqos;
        message.session = Session(context.id, "");
        message.content = Content(context.sender, string(context.session.callback), _data);
        return crossChainContract.sendMessage(message);
    }
}
