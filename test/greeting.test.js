const debug = require('debug')('ck');
const BN = require('bn.js');
const utils = require('./utils');
const web3 = require('web3');
const web3js = new web3(web3.givenProvider);

const CrossChain = artifacts.require('@hthuang/contracts/TwoPhaseCommitCrossChain');
const MessageVerify = artifacts.require('@hthuang/contracts/MessageVerify');
const Greetings = artifacts.require("Greetings");

const eq = assert.equal.bind(assert);

contract('Greetings', function(accounts) {
    let owner = accounts[0];
    let user1 = accounts[1];

    let crossChain;
    let greeting;
    let messageVerify;
    
    let initContract = async function() {
        crossChain = await CrossChain.new('PLATONEVMDEV');
        messageVerify = await MessageVerify.new();
        greeting = await Greetings.deployed();
        await crossChain.setVerifyContract(messageVerify.address);

        // register cross-chain contract address
        await greeting.setCrossChainContract(crossChain.address);

        // register porters
        await crossChain.changePortersAndRequirement([user1], 1);

        // register target
        await greeting.registerDestnContract('receiveGreeting', 'PLATONEVMDEV', Greetings.address, '0x2d436822');
    }

    before(async function() {
        await initContract();
    });

    describe('Send Greeting', function() {
        it('should execute successfully ', async () => {
            await greeting.sendGreeting('PLATONEVMDEV', ['PLATON', 'Greetings', 'Greeting from PLATON', 'Current date'], {from: owner});
        });
    });

    describe('Receive Greeting', function() {
        it('should execute successfully', async () => {
            let to = Greetings.address;
            let action = '0x2d436822';
            let item = {
                name: 'greeting',
                msgType: 11,
                value: '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000006504c41544f4e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000094772656574696e6773000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000144772656574696e672066726f6d20504c41544f4e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000374d6f6e204a756e20323720323032322031363a33343a323820474d542b3038303020284368696e61205374616e646172642054696d6529000000000000000000',
            };
            let calldata = {items: [item]};
            let argument = [1, 'PLATONEVMDEV', Greetings.address, owner, [1], to, action, calldata, [0, '0x11111111'], 0];
            await crossChain.receiveMessage(argument, {from: user1});
            await crossChain.executeMessage('PLATONEVMDEV', 1);
            let context = await crossChain.getCurrentMessage();
            assert(context.id.eq(new BN('1')));
            let g = await greeting.greetings(context.id);
            assert(g.fromChain != '');
        });
    });
});