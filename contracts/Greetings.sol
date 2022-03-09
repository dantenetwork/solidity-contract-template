// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContractBase.sol";

contract Greetings is ConsumerBase {
    struct Greeting {
        string fromChain;
        string title;
        string content;
        string date;
    }

    // Store greetings
    Greeting[] public greetings;

    // Store context of cross chain contract
    SimplifiedMessage public context;

    /**
     * Receive greeting info from other chains
     * @param _fromChain - from chain name
     * @param _title - greeting title
     * @param _content - greeting content
     * @param _date - date
     */
    function receiveGreeting(
        string calldata _fromChain,
        string calldata _title,
        string calldata _content,
        string calldata _date
    ) external {
        require(
            msg.sender == address(crossChainContract),
            "Locker: caller is not CrossChain"
        );
        Greeting storage g = greetings.push();
        g.fromChain = _fromChain;
        g.title = _title;
        g.content = _content;
        g.date = _date;

        // Get message info from CrossChain contract context
        context = crossChainContract.getCurrentMessage();
    }

    /**
     * Send greeting info to other chains
     * @param _toChain - to chain name
     * @param _title - greeting title
     * @param _content - greeting content
     * @param _date - date
     */
    function sendGreeting(
        string calldata _toChain,
        string calldata _title,
        string calldata _content,
        string calldata _date
    ) external {
        DestinationChain storage method = destinationChainMap[_toChain];
        require(method.used, "method not registered");

        bytes memory data = abi.encode("Avalanche", _title, _content, _date);
        SQOS memory sqos = SQOS(1);
        crossChainContract.sendMessage(
            _toChain,
            method.contractAddress,
            method.methodName,
            tx.origin,
            sqos,
            data
        );
    }

    // return context info
    function getContext() external view returns (SimplifiedMessage memory) {
        return context;
    }
}
