// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "./AALToken.sol";
import "./TokenBidon.sol";
import "./PriceConsumer.sol";

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
	TokenBidon public stackingToken;
	PriceConsumer public priceConsumer;
	uint8 public immutable DAILY_REWARD_RATE = 2;


	//Mapping of : Stake per User per Token staked
	// Token A => User A => Stake 1
	// Token A => User B => Stake 2
	// Token B => User A => Stake 3
	mapping(address => mapping(address => Stake)) public stakes;

	//TotalSupplyOfToken per token address
	mapping(address => uint256) public totalTokenSupply;

	//Id token of the list of token
	mapping(address => uint256) public idTokenOfListOfToken;

	//Helpers
	address[] public listOfStaker;
	address[] public listOfToken;


	/* ============= EVENT ============= */

	event Staking(address stakerAddress, uint256 amountToStake, address stakingToken);
    event Unstaking(address stakerAddress, uint256 amountToUnstake, address stakingToken);
	event Rewarding(address stakerAddress, uint256 rewards, address stakingToken);
	event Log(string message);

	
	/* ============= MODIFIER ============= */

	modifier amountStrictPositiv(uint256 _amount){
		require(_amount > 0,"Amount <= 0");
		_;
	}

	modifier stakerExist(address _token, address _sender){
		require(stakes[_token][_sender].staked || stakes[_token][_sender].rewards > 0,"Not a staker or no rewards");
		_;
	}

    //TODO change PriceConsumer in function of network
	//TODO delete TokenBin once testing ends
	constructor() {
		rewardsToken = new AALToken();
		priceConsumer = new PriceConsumer(0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0);
		stackingToken = new TokenBidon(100000);
		listOfToken.push();
	}


    /* ============= STAKE ============= */

	function stake(address _stakingToken, uint256 _amountToStake) public amountStrictPositiv(_amountToStake) {
		
		//Check allowance of the token IERC20 the user will stake
        require(IERC20(_stakingToken).allowance(msg.sender, address(this)) >= _amountToStake, "Check the token allowance");

        if(!stakes[_stakingToken][msg.sender].staked){
			//If this stake does not exist : Create the Stake struct in the Stake per User per Token mapping
			uint256 ts = block.timestamp;
			stakes[_stakingToken][msg.sender] = Stake(_amountToStake, ts, ts, 0, true);
			//And push that new staker
			listOfStaker.push(msg.sender);

			//If this id is > 0 then it already exist in the list
			if(idTokenOfListOfToken[_stakingToken] <= 0){
				listOfToken.push(_stakingToken);
				idTokenOfListOfToken[_stakingToken] = listOfToken.length-1;
			}
		} else {
			//If this stake already exists : Compute previous reward, update the timestamp and the amount
			stakes[_stakingToken][msg.sender].rewards += calcRewardPerStake(_stakingToken,msg.sender);
			stakes[_stakingToken][msg.sender].stakingAmount += _amountToStake;
			stakes[_stakingToken][msg.sender].updateTimestamp = block.timestamp;
		}
		
        //The total supply of that token increases of _amountToStake
		totalTokenSupply[_stakingToken] += _amountToStake;

        //Transfer from user's wallet to this contract of _amountToStake
        IERC20(_stakingToken).transferFrom(msg.sender,address(this),_amountToStake);

		emit Staking(msg.sender,_amountToStake,_stakingToken);
	}


	/* ============= UNSTAKE ============= */
    
	function unstake(address _stakingToken) public stakerExist(_stakingToken,msg.sender){
		
		//Calc and get rewards
		getReward(_stakingToken);
		
		//Re entrancy amount = 0
		uint256 _amountToUnstake = stakes[_stakingToken][msg.sender].stakingAmount;
		
		//Update of the total supply of that _stakingToken and delete from array if necessary
        totalTokenSupply[_stakingToken] -= _amountToUnstake;
		if(totalTokenSupply[_stakingToken] <= 0){
			delete listOfToken[idTokenOfListOfToken[_stakingToken]];
			delete idTokenOfListOfToken[_stakingToken];
		}
		
		//Update the struct of the Staker - Stake(0, tsStart, tsUpdated, rewards, false);
		stakes[_stakingToken][msg.sender].stakingAmount = 0;
		stakes[_stakingToken][msg.sender].staked = false;

		//Transfer the staked token
		IERC20(_stakingToken).transfer(msg.sender,_amountToUnstake);
		emit Unstaking(msg.sender,_amountToUnstake,_stakingToken);
    }


	/* ============= REWARDS ============= */

	/**
	 * Computes rewards and mint them to msg.sender
	 * _token : staked token
	 * require max every 30 sec can be called
	*/
    function getReward(address _stakingToken) public stakerExist(_stakingToken,msg.sender){
		require(block.timestamp - stakes[_stakingToken][msg.sender].updateTimestamp > 30 seconds,"stop spam");
		//Compute rewards = previous rewards calc (exemple : different staking time of the same token) + new rewards
		uint256 _rewardsInToken = stakes[_stakingToken][msg.sender].rewards;
		if(stakes[_stakingToken][msg.sender].stakingAmount > 0) {
			_rewardsInToken += calcRewardPerStake(_stakingToken, msg.sender);
		}
		//Re entrancy rewards = 0;
		stakes[_stakingToken][msg.sender].rewards = 0;
		//Convert rewards here
		uint256 _rewardsInPrice = calcRewardPrice(_stakingToken, _rewardsInToken);
		//Mint rewards
		rewardsToken.mint(msg.sender,_rewardsInPrice);
		emit Rewarding(msg.sender, _rewardsInPrice, address(rewardsToken));
    }

	//Get the rewards in "staked token" : rewardRate/100 * staking period * share of the pool at updateTime
    function calcRewardPerStake(address _token, address _sender) public returns(uint) {
		uint256 _rewards = DAILY_REWARD_RATE * (block.timestamp - stakes[_token][_sender].updateTimestamp) * stakes[_token][_sender].stakingAmount / (totalTokenSupply[_token] * 100 );
		//Update the timestamp
		stakes[_token][_sender].updateTimestamp = block.timestamp;
        return _rewards;
    }
	
	//Get the rewards in price : _rewards * price[_token]	
	function calcRewardPrice(address _token, uint256 _rewards) view public returns(uint) {
		return _rewards * getPriceOfToken(_token);
    }

	//Get the price in USD with chainlink of the _token
    function getPriceOfToken(address _token) view public returns(uint){
		try priceConsumer.getPrice(_token,Denominations.USD) returns(int x){
			return uint(x<0?-x:x);
		} catch {
			return 1;
		}
	}

	
	/* ============= HELPERS ============= */
	
	function getTokenList() public view returns(address[] memory){
		return listOfToken;
	}
	
	//Plus checked the constructor
}