// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "./AALToken.sol";

contract myStackingDapp {
	
	struct Stake {
		IERC20 stakingToken;
		uint256 stakingAmount;
		uint256 stakingTimestamp;
	}

	AALToken public rewardsToken;
	mapping(address => Stake) public stakes;

	constructor(uint256 _initialSupply) {
		rewardsToken = new AALToken(_initialSupply);
	}

	function stake(address _stakingToken, uint256 _amountToStake) public {
		stakes[msg.sender] = Stake(IERC20(_stakingToken),_amountToStake,block.timestamp);
		IERC20(_stakingToken).transferFrom(msg.sender,address(this),_amountToStake);
	}

	/// @dev Store ETH in the contract.
	function store() public payable {
		//balances[msg.sender]+=msg.value;
	}
	
	/// @dev Redeem your ETH.
	function redeem() public {
		//uint toSend = balances[msg.sender];
		//balances[msg.sender]=0;
		//msg.sender.call{ value: toSend }("");
	}
}

/*
interface IERC20 {
	function totalSupply() external view returns (uint);

	function balanceOf(address account) external view returns (uint);

	function transfer(address recipient, uint amount) external returns (bool);

	function allowance(address owner, address spender) external view returns (uint);

	function approve(address spender, uint amount) external returns (bool);

	function transferFrom(
		address sender,
		address recipient,
		uint amount
	) external returns (bool);

	event Transfer(address indexed from, address indexed to, uint value);
	event Approval(address indexed owner, address indexed spender, uint value);
}
*/

contract StakingRewards {
	IERC20 public rewardsToken;
	IERC20 public stakingToken;

	uint public rewardRate = 100;
	uint public lastUpdateTime;
	uint public rewardPerTokenStored;

	mapping(address => uint) public userRewardPerTokenPaid;
	mapping(address => uint) public rewards;

	uint private _totalSupply;
	mapping(address => uint) private _balances;

	constructor(address _stakingToken, address _rewardsToken) {
		stakingToken = IERC20(_stakingToken);
		rewardsToken = IERC20(_rewardsToken);
	}

	function rewardPerToken() public view returns (uint) {
		if (_totalSupply == 0) {
			return rewardPerTokenStored;
		}
		return
			rewardPerTokenStored +
			(((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / _totalSupply);
	}

	function earned(address account) public view returns (uint) {
		return
			((_balances[account] *
				(rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
			rewards[account];
	}

	modifier updateReward(address account) {
		rewardPerTokenStored = rewardPerToken();
		lastUpdateTime = block.timestamp;

		rewards[account] = earned(account);
		userRewardPerTokenPaid[account] = rewardPerTokenStored;
		_;
	}

	function stake(uint _amount) external updateReward(msg.sender) {
		_totalSupply += _amount;
		_balances[msg.sender] += _amount;
		stakingToken.transferFrom(msg.sender, address(this), _amount);
	}

	function withdraw(uint _amount) external updateReward(msg.sender) {
		_totalSupply -= _amount;
		_balances[msg.sender] -= _amount;
		stakingToken.transfer(msg.sender, _amount);
	}

	function getReward() external updateReward(msg.sender) {
		uint reward = rewards[msg.sender];
		rewards[msg.sender] = 0;
		rewardsToken.transfer(msg.sender, reward);
	}
}

