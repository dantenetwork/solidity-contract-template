# solidity-contract-template

## Currently
**This is under construction!**

This repo contains a basic `greeting` smart contract integrated with DANTE cross-chain service.

The basic version developed in `solidity` is currently available.

## Coming soon
- More functions in `solidity` version;
- The high level SDK for `cross-chain contract call` is under developing, that will bring more convenient for developers.
- The `Near Rust-wasm` version.

## Usage

Dependencies:
* @dante-contracts
* [@openzeppelin-contracts v4.4.2](https://github.com/OpenZeppelin/openzeppelin-contracts)
* [@truffle/hdwallet-provider v2.0.0](https://www.npmjs.com/package/@truffle/hdwallet-provider)

### Install
```
npm install -g truffle
npm install -d
```

### Compile smart contract
```
truffle compile
```

### Deploy smart contract to Avalanche FUJI testnet
```
truffle migrate --network avalancheFuji --reset --skip-dry-run
```

### Register greeting contract to DANTE cross-chain service
```
node register/registerToAvalanche.js
```