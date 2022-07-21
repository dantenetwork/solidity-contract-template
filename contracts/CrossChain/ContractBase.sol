// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@hthuang/contracts/interfaces/ICrossChain.sol";
import "./ChainAddress.sol";

contract ContractBase is Ownable {
    // Dante cross chain contract
    ICrossChain public crossChainContract;

    /**
     * Set cross chain contract
     * @param _address - cross chain contract address
     */
    function setCrossChainContract(address _address) public onlyOwner {
        crossChainContract = ICrossChain(_address);
    }

    // Returns context info
    function getContext() public view returns (SimplifiedMessage memory) {
        return crossChainContract.getCurrentMessage();
    }
}
