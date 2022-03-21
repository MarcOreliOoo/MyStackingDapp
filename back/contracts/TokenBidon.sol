// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract TokenBidon is ERC20 {
	constructor() ERC20("BidonToken", "BID") {
		_mint(msg.sender,100000*10**18);
		transfer(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2,25000*10**18);
	}


}