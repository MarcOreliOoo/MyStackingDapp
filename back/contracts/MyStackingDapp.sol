// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "./AALToken.sol";
import "./TokenBidon.sol";
import "./PriceConsumer.sol";


	//mapping(address => Stake) public stakes;
	//IERC20 stakingToken;
    
//Hypothese : stacking of WETH to get AALToken
contract myStackingDapp {
	
    //Stake struct with token staked
	struct Stake {
		uint256 stakingAmount;
		uint256 startStakingTimestamp;
		uint256 updateTimestamp;
		uint256 rewards;
		bool staked;
	}

    //Token rewarded for staking
	AALToken public rewardsToken;
	PriceConsumer public priceConsumer;
	uint8 public immutable DAILY_REWARD_RATE = 2;
	
	


    //Mapping of : Stake per User per Token staked
	// Token A => User A => Stake 1
	// Token A => User B => Stake 2
	// Token B => User A => Stake 3
	mapping(address => mapping(address => Stake)) public stakes;

	//TotalSupplyOfToken per token address
    mapping(address => uint256) public totalTokenSupply;

	//Helpers
	address[] public listOfStaker;
	address[] public listOfToken;

	event Staking(address stakerAddress, uint256 amountToStake, address stakingToken);
    event Unstaking(address stakerAddress, uint256 amountToUnstake, address stakingToken);
	event Rewarding(address stakerAddress, uint256 rewards, address stakingToken);

	modifier amountStrictPositiv(uint256 _amount){
		require(_amount > 0,"Amount <= 0");
		_;
	}

	modifier stakerExist(address _token, address _sender){
		require(stakes[_token][_sender].staked || stakes[_token][_sender].rewards > 0,"Not a staker or no rewards");
		_;
	}

    //Launch of this contract with definition of supply of AALToken, maybe to change...
	constructor() {
		rewardsToken = new AALToken();
		priceConsumer = new PriceConsumer(0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0);
		stackingToken = new TokenBidon(100000);
	}


    /* ============= STAKE ============= */

	function stake(address _stakingToken, uint256 _amountToStake) public amountStrictPositiv(_amountToStake) {
		
		//Check allowance of the token IERC20 the user will stake
        require(IERC20(_stakingToken).allowance(msg.sender, address(this)) >= _amountToStake, "Check the token allowance");

        if(!stakes[_stakingToken][msg.sender].staked){
			//If this stake does not exist : Create the Stake struc in the Stake per User per Token mapping
			uint256 ts = block.timestamp;
			stakes[_stakingToken][msg.sender] = Stake(_amountToStake, ts, ts, 0, true);
			//And push that new staker
			listOfStaker.push(msg.sender);
		} else {
			//If this stake already exists : Compute previous reward, update the timestamp and the amount
			stakes[_stakingToken][msg.sender].rewards += calcRewardPerStake(_stakingToken,msg.sender);
			stakes[_stakingToken][msg.sender].stakingAmount += _amountToStake;
			stakes[_stakingToken][msg.sender].updateTimestamp = block.timestamp;
		}
		
        //The total supply of that token increases of _amountToStake
		totalTokenSupply[_stakingToken] += _amountToStake;

		//If the totalSupply of that token is sup of the amount, that means the token already exists, so we don't need to push it in the array
		if(totalTokenSupply[_stakingToken] <= _amountToStake) {
			listOfToken.push(_stakingToken);
		}

        //Transfer from user's wallet to this contract of _amountToStake
        IERC20(_stakingToken).transferFrom(msg.sender,address(this),_amountToStake);

		emit Staking(msg.sender,_amountToStake,_stakingToken);
	}


	/* ============= UNSTAKE ============= */
    
	function unstake(address _stakingToken) public stakerExist(_stakingToken,msg.sender){
		//Computes reward first (in calc reward the updateTimestamp is updated so we dont do it here)
		stakes[_stakingToken][msg.sender].rewards += calcRewardPerStake(_stakingToken,msg.sender);
		
		uint256 _amountToUnstake = stakes[_stakingToken][msg.sender].stakingAmount;
		//Update of the total supply of that _stakingToken
        totalTokenSupply[_stakingToken] -= _amountToUnstake;
	
		//Update the struct of the Staker - Stake(0, tsStart, tsUpdated, rewards, false);
		stakes[_stakingToken][msg.sender].stakingAmount = 0;
		stakes[_stakingToken][msg.sender].staked = false;

		//Transfer the staked token
		IERC20(_stakingToken).transfer(msg.sender,_amountToUnstake);
		emit Unstaking(msg.sender,_amountToUnstake,_stakingToken);
    }


	/* ============= REWARDS ============= */

	/**
	 * Computes rewards and transfers them msg.sender
	 * _token : staked token
	 * require max every 30 sec can be called
	*/
	
    function getReward(address _stakingToken) public stakerExist(_stakingToken,msg.sender){
		require(block.timestamp - stakes[_stakingToken][msg.sender].updateTimestamp > 30 seconds,"stop spam");
		//Compute rewards = previous rewards calc + new rewards
		uint256 _rewards = stakes[_stakingToken][msg.sender].rewards;
		if(stakes[_stakingToken][msg.sender].stakingAmount > 0) {
			_rewards += calcRewardPerStake(_stakingToken, msg.sender);
		}
		
		//Re entrancy rewards = 0;
		stakes[_stakingToken][msg.sender].rewards = 0;

		//Mint rewards
		rewardsToken.mint(msg.sender,_rewards);

		//Transfer rewards
		//require(_rewards > 0 && rewardsToken.totalSupply() > _rewards,"Rewards = 0 or totalSupply reached!");
		//rewardsToken.transfer(msg.sender,_rewards);
		emit Rewarding(msg.sender, _rewards,address(rewardsToken));
    }

    function calcRewardPerStake(address _token, address _sender) internal returns(uint) {
		//Get the rewards : rewardRate * staking period * share of the pool at updateTime
		//uint256 _rewards = DAILY_REWARD_RATE * (block.timestamp - stakes[_token][_sender].updateTimestamp) * getPriceOfToken(_token) * stakes[_token][_sender].stakingAmount / (getPriceOfAllSupply() * 100 * 1 days );
		uint256 _rewards = DAILY_REWARD_RATE * (block.timestamp - stakes[_token][_sender].updateTimestamp) * getPriceOfToken(_token) * stakes[_token][_sender].stakingAmount / (getPriceOfAllSupply() * 100 );
		//Update the timestamp
		stakes[_token][_sender].updateTimestamp = block.timestamp;
        return _rewards;
    }
	
	//TODO pb of the array to correct
	function getPriceOfAllSupply() view public returns(uint){
		uint256 amount;
		for(uint i = 0; i<listOfToken.length ; i++){
			amount += getPriceOfToken(listOfToken[i])*totalTokenSupply[listOfToken[i]];
		}
		return amount;
	}

    function getPriceOfToken(address _token) view public returns(uint){
        //Oracle call here
		int x = priceConsumer.getPrice(_token,Denominations.USD);
		return uint(x<0?-x:x);
    }

	/*function getRewardRate() view public returns(uint){
		if(rewardsToken.totalSupply() > rewardsToken.initialSupply() * 80/100) {
			return 8;
		} else if(rewardsToken.totalSupply() > rewardsToken.initialSupply() * 60/100) {
			return 6;
		} else if(rewardsToken.totalSupply() > rewardsToken.initialSupply() * 40/100) {
			return 4;
		} else if(rewardsToken.totalSupply() > rewardsToken.initialSupply() * 20/100) {
			return 2;
		} else {
			return 1;
		}
	}*/
	
	/* ============= HELPERS ============= */
	
	//Testing field to delete
	uint8 public wf = 18;
	TokenBidon public stackingToken;
	
	function getTokenList() public view returns(address[] memory){
		return listOfToken;
	}
	
	//Plus checked the constructor
}