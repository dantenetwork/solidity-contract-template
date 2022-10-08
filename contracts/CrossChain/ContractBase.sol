// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@hthuang/contracts/interfaces/ICrossChain.sol";

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

    /**
     * This verify method will be invoked by the CrossChain contract automatically, ensure that only registered contract(registerSourceContract) calls are allowed
     * @param _chainName - chain name of cross chain message
     * @param _funcName - contract action name of cross chain message
     * @param _sender - cross chain message sender
     */
    //  Will be deprecated soon
    function verify(
        string calldata _chainName,
        bytes4 _funcName,
        bytes calldata _sender
    ) public view virtual returns (bool) {
        return true;
    }
}
