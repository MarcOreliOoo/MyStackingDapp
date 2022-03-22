// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

/// @dev AALTOken is the ERC20 token we will get in rewards for staking
contract AALToken is ERC20 {
	uint256 public initialSupply;
	constructor(uint256 _initialSupply) ERC20("AALToken", "AAL") {
		_mint(msg.sender,_initialSupply*10**18);
		initialSupply = _initialSupply*10**18;
	}
}