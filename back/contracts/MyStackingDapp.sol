// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "./AALToken.sol";


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
    uint8 public rewardRate = 100; //To define

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


	modifier amountStrictPositiv(uint256 _amount){
		require(_amount > 0,"Amount <= 0");
		_;
	}

    //Launch of this contract with definition of supply of AALToken, maybe to change...
	constructor(uint256 _initialSupply) {
		rewardsToken = new AALToken(_initialSupply);
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
			//TODO : reward non à jour
		}
		
        //The total supply of that token increases of _amountToStake
		totalTokenSupply[_stakingToken] += _amountToStake;

		//If the totalSupply of that token is sup of the amount, that means the token already exists, so we don't need to push it in the array
		if(totalTokenSupply[_stakingToken] <= _amountToStake) {
			listOfToken.push(_stakingToken);
		}

        //Transfer from user's wallet to this contract of _amountToStake
        IERC20(_stakingToken).transferFrom(msg.sender,address(this),_amountToStake);
	}

	/* ============= UNSTAKE ============= */
    
    function unstake() public {
       /* uint256 amountToUnstake = stakes[msg.sender].stakingAmount;
        IERC20 tokenToUnstake = stakes[msg.sender].stakingToken;
        delete stakes[msg.sender];//TODO enlever ça sinon on peut pas getReward
        
        totalTokenSupply[address(stakes[msg.sender].stakingToken)] -= amountToUnstake;
		tokenToUnstake.transfer(msg.sender,amountToUnstake);*/
    }


	/* ============= REWARDS ============= */

	//TODO : add anti spam
    function getReward(address _token) public amountStrictPositiv(stakes[_token][msg.sender].stakingAmount) {
		//Compute rewards = previous rewards calc + new rewards
		uint256 rewards = stakes[_token][msg.sender].rewards + calcRewardPerStake(_token, msg.sender);
		//Re entrancy rewards = 0;
		stakes[_token][msg.sender].rewards = 0;
		//Transfer rewards
		rewardsToken.transfer(msg.sender,rewards);
    }


    function calcRewardPerStake(address _token, address _sender) internal returns(uint) {
		//Get the reward
		uint256 rewards = (rewardRate * (block.timestamp - stakes[_token][_sender].updateTimestamp) * getPriceOfToken(_token) * stakes[_token][_sender].stakingAmount / getPriceOfAllSupply());
		//Update the timestamp
		stakes[_token][_sender].updateTimestamp = block.timestamp;
        return rewards;
    }

	function getPriceOfAllSupply() view public returns(uint){
		uint256 amount;
		for(uint i = 0; i<listOfToken.length ; i++){
			amount += getPriceOfToken(listOfToken[i])*totalTokenSupply[listOfToken[i]];
		}
		return amount;
	}

    function getPriceOfToken(address _token) pure public returns(uint){
        //Oracle call here
		return 1;
    }



}