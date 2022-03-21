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
For this app we use a reward calculation based on the staking time elapsed and proportionnaly with the total supply.
Rewards are determined at 3 places :
- When a user restake an amount of a previously staked token, it computes the reward for this token for the time elapsed before restaking the token but do not transfer it to the user.
- When a user unstake a previously staked token , it computes the rewards of that token that the user will claim lately (so in the same maner as the previous point, it does not transfer it to the user).
- When a user presses the getReward button, it does not unstake. It only computes the rewards of that token, and transfers it to the user.

The basic formula is then : RewardRate * (currentTs - updatedTs) * price(token) * quantity(token) / totalPrice(token)
Where
- RewardRate stands for the rate of the rewards token the user will get.
- currentTs : block.timestamp
- updateTs : timestamp updated since last staking or last computation of rewards
- price(token) is given by ChainLink Oracle
- totalPrice(token) is given by ChainLink Oracle

## Rewards calculation - next step
Determine how to measure the price variation between too dates, because right now, we only take the price at the currentTs. If the price drop a lot between the too ts, and then comeback, it won't reflect on the staking rewards, and that is not what we want. 
More to come later...

