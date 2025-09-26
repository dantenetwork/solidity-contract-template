// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContractBase.sol";

contract ContractAdvanced is ContractBase {
    mapping(bytes32 => string) public callbackAbis;

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
    function crossChainCall(string memory _destnChainName, bytes memory _destnContractName,
        bytes memory _funcName, SQoS[] memory _sqos, Payload memory _data, bytes4 _callback) internal returns (uint256) {
        ISentMessage memory message;
        message.toChain = _destnChainName;
        message.sqos = _sqos;
        message.session = Session(0, 0, bytes.concat(_callback), "", "");
        message.content = Content(_destnContractName, _funcName, _data);
        return crossChainContract.sendMessage(message);
    }

    ///////////////////////////////////////////////
    ///// Cross-chain respond to other chains//////
    ///////////////////////////////////////////////

    /**
     * Cross chain respond
     * @param _sqos - security parameters
     * @param _data - cross chain data
     */
    function crossChainRespond(SQoS[] memory _sqos, Payload memory _data) internal returns (uint256) {
        SimplifiedMessage memory context = getContext();
        ISentMessage memory message;
        message.toChain = context.fromChain;
        message.sqos = _sqos;
        message.session = Session(context.id, 0, "", "", "");
        message.content = Content(context.sender, context.session.callback, _data);
        return crossChainContract.sendMessage(message);
    }
}
