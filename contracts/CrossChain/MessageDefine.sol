// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

struct Data {
    bytes arguments;
}

struct Content {
    string contractAddress;
    string action;
    Data data;
}

struct SQOS {
    uint8 reveal;
}

struct Response {
    uint8 resType;  // 0: not need a response, 1: needs a response, 2: this is a response message, 
    uint256 id;
}

struct SentMessage {
    uint256 id; // message id
    string fromChain; // source chain name
    string toChain; // destination chain name
    address sender; // message sender
    address signer; // message signer
    SQOS sqos;
    Content content; // message content
    Response response;   
}

struct ReceivedMessage {
    uint256 id; // message id
    string fromChain; // source chain name
    string sender; // message sender
    string signer;
    SQOS sqos;
    address contractAddress; // message content
    string action;
    bytes data;
    Response response;
    bool executed; // if message has been executed
    uint256 errorCode; // it will be 0 if no error occurs
}

// simplify message to save gas
struct SimplifiedMessage {
    uint256 id; // message id
    string fromChain; // source chain name
    string sender; // message sender
    string signer;
    SQOS sqos;
    address contractAddress; // message content
    string action;
    Response response;
}

struct cachedReceivedMessage {
    ReceivedMessage message;
    address porter;
}
