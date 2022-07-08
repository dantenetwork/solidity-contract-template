#!/bin/bash

cp -r ../dante-cross-chain/avalanche/contracts/* ./node_modules/@hthuang/contracts/
mkdir -p ./node_modules/@hthuang/contracts/build/contracts/
cp -r ../dante-cross-chain/avalanche/build/contracts/* ./node_modules/@hthuang/contracts/build/contracts/