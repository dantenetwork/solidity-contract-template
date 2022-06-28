const debug = require('debug')('ck');
const BN = require('bn.js');
const utils = require('./utils');
const web3 = require('web3');
const web3js = new web3(web3.givenProvider);

const CrossChain = artifacts.require('@hthuang/contracts/TwoPhaseCommitCrossChain');
const MessageVerify = artifacts.require('@hthuang/contracts/MessageVerify');
const OCComputing = artifacts.require("OCComputing");

const eq = assert.equal.bind(assert);

contract('OCComputing', function(accounts) {
    let owner = accounts[0];
    let user1 = accounts[1];

    let crossChain;
    let ocComputing;
    let messageVerify;
    
    let initContract = async function() {
        crossChain = await CrossChain.new('PLATONEVMDEV');
        messageVerify = await MessageVerify.new();
        ocComputing = await OCComputing.deployed();
        await crossChain.setVerifyContract(messageVerify.address);

        // register cross-chain contract address
        await ocComputing.setCrossChainContract(crossChain.address);

        // register porters
        await crossChain.changePortersAndRequirement([user1], 1);

        // register target
        await ocComputing.registerMessageABI('PLATONEVMDEV', OCComputing.address, 'receiveComputeTask', 'string,uint256[]', '_toChain,_nums');
        await ocComputing.registerDestnContract('receiveComputeTask', 'PLATONEVMDEV', OCComputing.address, 'receiveComputeTask');

        // register interface
        let function_str = '{"inputs":[{"internalType":"uint256[]","name":"_nums","type":"uint256[]"}],"name":"receiveComputeTask","outputs":[],"stateMutability":"nonpayable","type":"function"}';
        await ocComputing.registerContractABI('receiveComputeTask', function_str);
        function_str = '{"inputs":[{"internalType":"uint256","name":"_result","type":"uint256"}],"name":"receiveComputeTaskCallback","outputs":[],"stateMutability":"nonpayable","type":"function"}';
        await ocComputing.registerContractABI('receiveComputeTaskCallback', function_str);

        // register permitted contracts
        await ocComputing.registerPermittedContract('PLATONEVMDEV', OCComputing.address, 'receiveComputeTask');
        await ocComputing.registerPermittedContract('PLATONEVMDEV', OCComputing.address, 'receiveComputeTaskCallback');
    }

    before(async function() {
        await initContract();
    });

    describe('Send OC Computing Task', function() {
        it('should execute successfully ', async () => {
            await ocComputing.sendComputeTask('PLATONEVMDEV', [1,2,3,6], {from: owner});
        });
    });

    describe('Receive OC Computing Task', function() {
        it('should execute successfully', async () => {
            let to = OCComputing.address;
            let action = '0x1db89088';
            let calldata = '0x00';
            let argument = [1, 'PLATONEVMDEV', OCComputing.address, owner, [0], to, action, calldata, [0, '0x11111111'], 0];
            console.log('argument' ,argument, await crossChain.verifyContract())
            await crossChain.receiveMessage(argument, {from: user1});
            await crossChain.executeMessage('PLATONEVMDEV', 1);
            let context = await crossChain.currentSimplifiedMessage();
            assert(context.id.eq(new BN('1')));
        });
    });

    describe('Receive OC Computing Task Callback', function() {
        it('should execute successfully', async () => {
            let to = OCComputing.address;
            let action = '0xdb1b3c7f';
            let calldata = '0x00';
            let argument = [2, 'PLATONEVMDEV', OCComputing.address, owner, [0], to, action, calldata, [0, '0x11111111'], 0];
            await crossChain.receiveMessage(argument, {from: user1});
            await crossChain.executeMessage('PLATONEVMDEV', 2);
            let context = await crossChain.currentSimplifiedMessage();
            assert(context.id.eq(new BN('2')));
            let result = await ocComputing.ocResult(1);
            assert(result.result.eq(new BN('12')));
        });
    });
});