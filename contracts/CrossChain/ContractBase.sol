// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@hthuang/contracts/interfaces/ICrossChain.sol";

contract ContractBase is Ownable {
    // Message ABI used to encode/decode messages sent from this contract
    struct MessageABI {
        string parametertypes; // action params' type
        string parameterNames; // action params' name
    }

    // desination contract action mapping
    mapping(bytes => MessageABI) public messageABIMap;

    // source contract action mapping
    mapping(string => string) public contractABIMap;

    // Dante cross chain contract
    ICrossChain public crossChainContract;

    /**
     * Set cross chain contract
     * @param _address - cross chain contract address
     */
    function setCrossChainContract(address _address) public onlyOwner {
        crossChainContract = ICrossChain(_address);
    }

    // return context info
    function getContext() public view returns (SimplifiedMessage memory) {
        return crossChainContract.getCurrentMessage();
    }
}
