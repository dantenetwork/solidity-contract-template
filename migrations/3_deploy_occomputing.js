const OCComputing = artifacts.require("OCComputing");
const fs = require("fs");

module.exports = async function (deployer, network) {
  await deployer.deploy(OCComputing);
  
  if (network.indexOf('-fork') != -1 || network == 'test') {
    return;
  }
  
  const contractAddressFile = './config/default.json';
  let data = fs.readFileSync(contractAddressFile, 'utf8');
  let jsonData = JSON.parse(data);
  if (!jsonData[network]) {
    console.warn('There is no config for: ', network, ', please add.');
    jsonData[network] = {};
  }

  jsonData[network].computingContractAddress = OCComputing.address;
  fs.writeFileSync(contractAddressFile, JSON.stringify(jsonData, null, '\t'));
};