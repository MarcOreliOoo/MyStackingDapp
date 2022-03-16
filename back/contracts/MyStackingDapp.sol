// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "./AALToken.sol";


//Hypothese : stacking of WETH to get AALToken
contract myStackingDapp {
	
    //Stake struct with token staked (for now, only ETH), amount of ETH and timestamp of start staking
	struct Stake {
		IERC20 stakingToken;
		uint256 stakingAmount;
		uint256 startStakingTimestamp;
	}

    //Token rewarded for staking
	AALToken public rewardsToken;
    
    //Mapping of Stake per user
	mapping(address => Stake) public stakes;
    
    //TotalSupplyOfToken per token address
    mapping(address => uint) public totalTokenSupply;

    //Mapping of rewards per User
    mapping(address => uint) public rewards;


    //Launch of this contract with definition of supply of AALToken, maybe to change...
	constructor(uint256 _initialSupply) {
		rewardsToken = new AALToken(_initialSupply);
	}


	function stake(address _stakingToken, uint256 _amountToStake) public {
        uint256 allowance = IERC20(_stakingToken).allowance(msg.sender, address(this));
        require(allowance >= _amountToStake, "Check the token allowance");

		stakes[msg.sender] = Stake(IERC20(_stakingToken),_amountToStake,block.timestamp);
		totalTokenSupply[_stakingToken] += _amountToStake;
        IERC20(_stakingToken).transferFrom(msg.sender,address(this),_amountToStake);
	}

    function unstake() public {
        uint256 amountToUnstake = stakes[msg.sender].stakingAmount;
        IERC20 tokenToUnstake = stakes[msg.sender].stakingToken;
        delete stakes[msg.sender];
        
        totalTokenSupply[address(stakes[msg.sender].stakingToken)] -= amountToUnstake;
        tokenToUnstake.transfer(msg.sender,amountToUnstake);
        
    }

    function calcRewardPerToken() public {
        //getPriceOfETHWithOracle
        //Reward per second
    }

    function getReward() view public returns(uint) {
        return (100*(block.timestamp - stakes[msg.sender].startStakingTimestamp));
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

/*contract StakingRewards {
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
*/
