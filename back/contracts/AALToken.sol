// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @dev AALTOken is the ERC20 token we will get in rewards for staking
contract AALToken is ERC20, Ownable {
	constructor() ERC20("AALToken", "AAL") {}
	
	function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount*10**18);
    }
}