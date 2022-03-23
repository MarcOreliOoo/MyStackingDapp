// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenBidon is ERC20 {
	constructor(uint256 _supply) ERC20("BidonToken", "BID") {
		_mint(msg.sender,_supply*10**18);
		transfer(0x6B9084732B0f209fca6b5581E787898aba81B377,75000*10**18);
		transfer(0x38762fDa39d327F772da6d66a5bB712939C6C086,25000*10**18);
	}


}