// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DanteToken.sol";
import "./ICrossChain.sol";

// string constant FROM_CHAIN_NAME = "PlatON";
string constant FROM_CHAIN_NAME = "AVALANCHE";

/*
 * This is a contract for cross chain, it only implement general cross-chain
 * functions. If you needs a shreshold for receiving message, you can derive
 * a contract inheritted from this contract, so is making a contract with a
 * deleting function.
 */
abstract contract CrossChain is ICrossChain, Ownable {
    struct TargetInfo {
        string abiString;
        string parameterNamesString;
        string parametertypesString;
    }

    // target mapping
    mapping(address => mapping(string => TargetInfo)) public targets;
    // interface mapping
    mapping(address => mapping(string => string)) public interfaces;
    // Dante token contract
    DanteToken public tokenContract;
    // Message sender
    address public messageSender;
    // sent message table
    mapping(string => SentMessage[]) internal sentMessageTable;
    /*
    The key is continually incremented to identify the received message.
    Multiple unprocessed messages can exist at the same time, and
    messages that are too old will be cleared  
  */
    mapping(string => ReceivedMessage[]) internal receivedMessageTable;
    // available received message index table
    // @note: this can be moved to a derived contract
    mapping(string => uint256) public availableReceivedMessageIndexTable;
    // simplify message to save gas
    SimplifiedMessage public currentSimplifiedMessage;

    /**
     * @dev See ICrossChain.
     */
    function setTokenContract(address _address) external onlyOwner {
        tokenContract = DanteToken(_address);
    }

    /**
     * @dev See ICrossChain.
     */
    function sendMessage(
        string calldata _toChain,
        string calldata _contractAddress,
        string calldata _methodName,
        address _signer,
        SQOS calldata _sqos,
        bytes calldata _data
    ) external {
        SentMessage[] storage chainMessage = sentMessageTable[_toChain];
        SentMessage storage message = chainMessage.push();
        message.id = chainMessage.length;
        message.content = Content(_contractAddress, _methodName, Data(_data));
        message.fromChain = FROM_CHAIN_NAME;
        message.toChain = _toChain;
        message.sender = msg.sender;
        message.signer = _signer;
        message.sqos = _sqos;
    }

    /**
     * @dev Abandons message.
     */
    function _abandonMessage(
        uint256 _id,
        string calldata _fromChain,
        uint256 _errorCode
    ) internal {
        ReceivedMessage[] storage chainMessage = receivedMessageTable[
            _fromChain
        ];
        require(_id == chainMessage.length + 1, "CrossChain: id not match");

        ReceivedMessage storage message = chainMessage.push();
        message.id = _id;
        message.fromChain = _fromChain;
        message.errorCode = _errorCode;
    }

    /**
     * @dev Receives message.
     */
    function _receiveMessage(
        uint256 _id,
        string memory _fromChain,
        string memory _sender,
        address _to,
        string memory _action,
        bytes memory _data
    ) internal {
        ReceivedMessage[] storage chainMessage = receivedMessageTable[
            _fromChain
        ];
        require(_id == chainMessage.length + 1, "CrossChain: id not match");

        ReceivedMessage storage message = chainMessage.push();
        message.id = _id;
        message.fromChain = _fromChain;
        message.sender = _sender;
        message.contractAddress = _to;
        message.action = _action;
        message.data = _data;
    }

    /**
     * @dev See ICrossChain.
     */
    function executeMessage(string calldata _chainName, uint256 _id) external {
        ReceivedMessage[] storage chainMessage = receivedMessageTable[
            _chainName
        ];
        ReceivedMessage storage message = chainMessage[_id - 1];
        require(!message.executed, "The message has been executed");
        message.executed = true;

        bytes memory data = abi.encodeWithSignature(
            "verify(string,string,string)",
            _chainName,
            message.action,
            message.sender
        );
        (bool verifySuccess, ) = message.contractAddress.call(data);
        if (!verifySuccess) {
            revert("verify failed");
        }

        currentSimplifiedMessage = SimplifiedMessage(
            message.id,
            message.fromChain,
            message.sender,
            message.signer,
            message.sqos,
            message.contractAddress,
            message.action
        );

        (bool success, ) = message.contractAddress.call(message.data);
        if (!success) {
            revert("call function failed");
        }
    }

    /**
     * @dev See ICrossChain.
     */
    function getCurrentMessage()
        external
        view
        returns (SimplifiedMessage memory)
    {
        return currentSimplifiedMessage;
    }

    /**
     * @dev See ICrossChain.
     */
    function getSentMessageNumber(string calldata _chainName)
        external
        view
        returns (uint256)
    {
        SentMessage[] storage chainMessage = sentMessageTable[_chainName];
        return chainMessage.length;
    }

    /**
     * @dev See ICrossChain.
     */
    function getReceivedMessageNumber(string calldata _chainName)
        external
        view
        returns (uint256)
    {
        ReceivedMessage[] storage chainMessage = receivedMessageTable[
            _chainName
        ];
        return chainMessage.length;
    }

    /**
     * @dev See ICrossChain.
     */
    function getSentMessage(string calldata _chainName, uint256 _id)
        external
        view
        returns (SentMessage memory)
    {
        SentMessage[] storage chainMessage = sentMessageTable[_chainName];
        return chainMessage[_id - 1];
    }

    /**
     * @dev See ICrossChain.
     */
    function getReceivedMessage(string calldata _chainName, uint256 _id)
        external
        view
        returns (ReceivedMessage memory)
    {
        ReceivedMessage[] storage chainMessage = receivedMessageTable[
            _chainName
        ];
        return chainMessage[_id - 1];
    }

    function registerTarget(
        string calldata _funcName,
        string calldata _abiString,
        string calldata _paramName,
        string calldata _paramType
    ) external {
        mapping(string => TargetInfo) storage infoTarget = targets[msg.sender];
        TargetInfo memory info = TargetInfo(_abiString, _paramName, _paramType);
        infoTarget[_funcName] = info;
    }

    function registerInterface(
        string calldata _funcName,
        string calldata _interface
    ) external {
        mapping(string => string) storage infoInterface = interfaces[
            msg.sender
        ];
        infoInterface[_funcName] = _interface;
    }

    function getExecutableMessages(string[] calldata _chainNames)
        external
        view
        returns (ReceivedMessage[] memory)
    {
        uint256 total_num = 0;
        for (uint256 i = 0; i < _chainNames.length; i++) {
            ReceivedMessage[] storage chainMessage = receivedMessageTable[
                _chainNames[i]
            ];
            for (uint256 j = 0; j < chainMessage.length; j++) {
                ReceivedMessage storage message = chainMessage[j];
                if (message.errorCode == 0 && !message.executed) {
                    total_num++;
                }
            }
        }

        ReceivedMessage[] memory ret = new ReceivedMessage[](total_num);
        total_num = 0;
        for (uint256 i = 0; i < _chainNames.length; i++) {
            ReceivedMessage[] storage chainMessage = receivedMessageTable[
                _chainNames[i]
            ];
            for (uint256 j = 0; j < chainMessage.length; j++) {
                ReceivedMessage storage message = chainMessage[j];
                if (message.errorCode == 0 && !message.executed) {
                    ret[total_num] = message;
                    total_num++;
                }
            }
        }

        return ret;
    }

    function getMsgPortingTask(string calldata _chainName)
        external
        view
        returns (uint256)
    {
        return this.getReceivedMessageNumber(_chainName) + 1;
    }
}
