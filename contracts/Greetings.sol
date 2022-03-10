// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CrossChain/ContractBase.sol";

contract Greetings is ContractBase {
    // Destination contract info
    struct DestnContract {
        string contractAddress; // destination contract address
        string actionName; // destination contract action name
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
    mapping(string => DestnContract) public destnContractMap;

    // Cross-chain permitted contract map
    mapping(string => mapping(string => string)) public permittedContractMap;

    // Store greetings
    Greeting[] public greetings;

    // Store context of cross chain contract
    // SimplifiedMessage public context;

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
    ) public {
        require(
            msg.sender == address(crossChainContract),
            "Locker: caller is not CrossChain"
        );

        // `context` used for verify the operation authority
        SimplifiedMessage memory context = getContext();
        // verify sqos
        require(context.sqos.reveal == 1, "SQoS invalid!");

        // verify the sender from the registered chain
        mapping(string => string)
            storage permittedContract = permittedContractMap[context.fromChain];

        require(
            keccak256(bytes(permittedContract[context.action])) ==
                keccak256(bytes(context.sender)),
            "message sender is not registered!"
        );

        Greeting storage g = greetings.push();
        g.fromChain = _fromChain;
        g.title = _title;
        g.content = _content;
        g.date = _date;
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
        DestnContract storage destnContract = destnContractMap[_toChain];
        require(destnContract.used, "action not registered");

        bytes memory data = abi.encode("Avalanche", _title, _content, _date);
        SQOS memory sqos = SQOS(1);
        crossChainContract.sendMessage(
            _toChain,
            destnContract.contractAddress,
            destnContract.actionName,
            tx.origin,
            sqos,
            data
        );
    }

    /**
     * Register destination contract info
     * @param _toChain - destination chain name
     * @param _contractAddress - destination contract address
     * @param _funcName - contract function bane
     */
    function registerDestnContract(
        string calldata _toChain,
        string calldata _contractAddress,
        string calldata _funcName
    ) external onlyOwner {
        DestnContract storage destnContract = destnContractMap[_toChain];
        destnContract.contractAddress = _contractAddress;
        destnContract.actionName = _funcName;
        destnContract.used = true;
    }

    /**
     * Authorize contracts of other chains to call the functions of this contract
     * @param _chainName - from chain name
     * @param _sender - sender of cross chain message
     * @param _actionName - action name which allowed to be invoked
     */
    function registerPermittedContract(
        string calldata _chainName,
        string calldata _sender,
        string calldata _actionName
    ) external onlyOwner {
        mapping(string => string) storage map = permittedContractMap[
            _chainName
        ];
        map[_actionName] = _sender;
    }

    /**
     * This verify method will be invoked by the CrossChain contract automatically, ensure that only registered contract(registerSourceContract) calls are allowed
     * @param _chainName - chain name of cross chain message
     * @param _actionName - contract action name of cross chain message
     * @param _sender - cross chain message sender
     */
    //  Will be deprecated soon
    function verify(
        string calldata _chainName,
        string calldata _actionName,
        string calldata _sender
    ) public view virtual returns (bool) {
        mapping(string => string) storage map = permittedContractMap[
            _chainName
        ];
        string storage sender = map[_actionName];
        require(
            keccak256(bytes(sender)) == keccak256(bytes(_sender)),
            "Sender does not match"
        );
        return true;
    }
}
