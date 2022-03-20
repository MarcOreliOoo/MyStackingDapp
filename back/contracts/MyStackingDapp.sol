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
    
	uint8 public rewardRate = 100; //To define

    //Mapping of Stake per user
	mapping(address => Stake) public stakes;
    
    //TotalSupplyOfToken per token address
    mapping(address => uint) public totalTokenSupply;
	address[] public listOfToken;

    //Launch of this contract with definition of supply of AALToken, maybe to change...
	constructor(uint256 _initialSupply) {
		rewardsToken = new AALToken(_initialSupply);
	}

    //Todo handle multiple stake of different token for one user.
    //What happens right now ? erase previous stake ?
	function stake(address _stakingToken, uint256 _amountToStake) public {
		//Check the amount is > 0
		require(_amountToStake > 0,"Amount <= 0");
        //Check allowance of the token IERC20 the user will stake
        uint256 allowance = IERC20(_stakingToken).allowance(msg.sender, address(this));
        require(allowance >= _amountToStake, "Check the token allowance");

        //Create the Stake struc in the Stake per user mapping
		stakes[msg.sender] = Stake(IERC20(_stakingToken),_amountToStake,block.timestamp);

        //The total supply of that token increases of _amountToStake
		totalTokenSupply[_stakingToken] += _amountToStake;
		//If the totalSupply of that token is sup of the amount, that means the token already exists, so we don't need to push it in the array
		if(totalTokenSupply[_stakingToken] <= _amountToStake) {
			listOfToken.push(_stakingToken);
		}

        //Transfer from user's wallet to this contract of _amountToStake
        IERC20(_stakingToken).transferFrom(msg.sender,address(this),_amountToStake);
	}

    //For now, unstake full staked token of a user
    function unstake() public doableAction(msg.sender) {
        uint256 amountToUnstake = stakes[msg.sender].stakingAmount;
        IERC20 tokenToUnstake = stakes[msg.sender].stakingToken;
        delete stakes[msg.sender];//TODO enlever ça sinon on peut pas getReward
        
        totalTokenSupply[address(stakes[msg.sender].stakingToken)] -= amountToUnstake;
		tokenToUnstake.transfer(msg.sender,amountToUnstake);
    }

	/* ============= REWARDS ============= */

	modifier doableAction(address account){
		require(stakes[msg.sender].stakingAmount > 0,"not enough staked");
		_;
	}

	//TODO can be call several times
	// stocker ça dans un array et soustraire au calcul
    function getReward() public doableAction(msg.sender) {
		uint256 rewards = calcRewardPerToken(stakes[msg.sender]);
		rewardsToken.transfer(msg.sender,rewards);
    }


    function calcRewardPerToken(Stake memory aStake) public view returns(uint){
        return (rewardRate * (block.timestamp - aStake.startStakingTimestamp) * getPriceOfToken(address(aStake.stakingToken)) * aStake.stakingAmount / getPriceOfAllSupply());
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