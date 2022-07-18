// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

uint8 constant EVM_CHAIN = 1;
uint8 constant INK_CHAIN = 1;
uint8 constant NEAR_CHAIN = 1;

struct AddressStruct {
    address evmAddress;
    string otherAddress;
    uint8 chainType;
}