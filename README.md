# MyStackingDapp

# Goals : be able to
- Create an ERC20 token for rewards
- Stake/Unstake ERC20 tokens, DAI, USDC, w/e ERC20 ;)
- Use the ERC20 created for rewards
- Rewards quantity muwt be proportionnal to the blocked value in the smart contract
- Using Chainlink Oracle to get a true price

# Stack IT
- Back folder : solidity smart contracts, openzeppelin library, chainlink...
- Front folder : react app

## Rewards calculation
For this app we use a reward calculation based on the staking time elapsed and proportionnaly with the total supply of the token type staked.
Rewards are determined at 3 places :
- When a user restake an amount of a previously staked token, it computes the reward for this token for the time elapsed before restaking the token but do not transfer it to the user.
- When a user unstakes a previously staked token : it computes the rewards of that token and mint it to the user and unstake the token.
- When a user presses the getReward button, it does not unstake. It only computes the rewards of that token, and mint it to the user.

The basic formula is then : DailyRewardRate * (currentTs - updatedTs) * price(token) * quantity(token) / totalPrice(token) * 100 * 3600
Where
- RewardRate stands for the rate of the rewards token the user will get.
- currentTs : block.timestamp
- updateTs : timestamp updated since last staking or last computation of rewards
- price(token) is given by ChainLink Oracle
- totalPrice(token) is given by ChainLink Oracle

# What I learn doing this app ?
- Better calculate the reward as a percent of the token staked, and transforms it in a price reward of the "reward token" when user claims it
- Better mint rewards than create a limited supply, as with time, the amount of supply will decrease, thus the rewards too. This is counterproductive as we expect a staking application to give us more rewards the longer we stake...
- Don't forget to use try catch to get chainlink prices

# What would be the next step ?
- What can we do with the staked tokens users have deposited ? Take them and stake them elsewere ?
- To ensure users come to our platform we should think about incentive too
