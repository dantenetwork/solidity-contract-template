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
        await ocComputing.registerDestnContract('receiveComputeTask', 'PLATONEVMDEV', OCComputing.address, 'receiveComputeTask');
        await ocComputing.registerDestnContract('receiveComputeTaskCallback', 'PLATONEVMDEV', OCComputing.address, 'receiveComputeTaskCallback');
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
            let action = '0x47e50a42';
            let item = {
                name: 'nums',
                msgType: 14,
                value: '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000006504c41544f4e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000094772656574696e6773000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000144772656574696e672066726f6d20504c41544f4e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000374d6f6e204a756e20323720323032322031363a33343a323820474d542b3038303020284368696e61205374616e646172642054696d6529000000000000000000',
            };
            let calldata = {items: [item]};
            let argument = [1, 'PLATONEVMDEV', OCComputing.address, owner, [0], to, action, calldata, [0, utils.toHexString(utils.stringToByteArray('0x11111111'))], 0];
            await crossChain.receiveMessage(argument, {from: user1});
            await crossChain.executeMessage('PLATONEVMDEV', 1);
            let context = await crossChain.getCurrentMessage();
            assert(context.id.eq(new BN('1')));
        });
    });

    describe('Receive OC Computing Task Callback', function() {
        it('should execute successfully', async () => {
            let to = OCComputing.address;
            let action = '0x7fac1127';
            let item = {
                name: 'result',
                msgType: 3,
                value: '0x000000000000000000000000000000000000000000000000000000000000000c',
            };
            let calldata = {items: [item]};
            let argument = [2, 'PLATONEVMDEV', OCComputing.address, owner, [0], to, action, calldata, [1, '0x11111111'], 0];
            await crossChain.receiveMessage(argument, {from: user1});
            await crossChain.executeMessage('PLATONEVMDEV', 2);
            let context = await crossChain.getCurrentMessage();
            assert(context.id.eq(new BN('2')));
            let result = await ocComputing.ocResult(1);
            assert(result.result.eq(new BN('12')));
        });
    });
});