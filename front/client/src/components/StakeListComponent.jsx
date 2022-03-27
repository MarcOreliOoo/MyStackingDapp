import React, { useState, useEffect } from "react";
import ERC20 from "../contracts/ERC20.json";
import Card from "react-bootstrap/Card";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
import timeSince from "../utils/timeSince";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function StakeListComponent({web3, accounts, contract, stakedToken}){
	const [loading, setLoading] = useState(true); //By default is loading
	const [tokenList, setTokenList] = useState([]);
	const [stakedOnly,toggleStakedOnly] = useToggle();
	const [unstakedToken, setUnstakedToken] = useState("");
	const [rewardedToken, setRewardedToken] = useState("");

	useEffect(function(){
		(async function(){
			if(contract){
				const response = await contract.methods.getTokenList().call();
				//Exclusion of NULL_ADDRESS;
				const _tokenList = response.filter(anAddress => anAddress != NULL_ADDRESS);
				setTokenList(_tokenList);
				setLoading(false);
			}
		})();
	},[stakedToken, unstakedToken]);

	const unstakeToken = async (address) =>{
		await contract.methods.unstake(address).send({from: accounts[0]})
			.on("receipt",function(receipt){
				setUnstakedToken(address);
				console.log(receipt);
			})
			.on("error",function(error){
				console.log(error);
			});
	};

	const rewardeToken = async (address) => {
		await contract.methods.getReward(address).send({from: accounts[0]})
		.on("receipt",function(receipt){
			setRewardedToken(address);
			console.log(receipt);
		})
		.on("error",function(error){
			console.log(error);
		});
	}
	
	
	if (loading){
		return <></>;
	}
	return <>
		<Card>
			<Card.Header >
				<Stack gap={2} direction="horizontal">
					<div className="me-auto h5">Staking</div>
					<Form><Form.Check type="switch" id="custom-switch" label="Staked only" onChange={toggleStakedOnly} checked={stakedOnly}/></Form>
				</Stack>
			</Card.Header>
			<Card.Body>
				<Table striped bordered hover size="sm" responsive="sm" >
				<thead>
					<tr>
						<th>#</th>
						<th>Token Address</th>
						<th>Token Name</th>
						<th>Quantity</th>
						<th>First deposit</th>
						<th>Last update</th>
						<th>Rewards to claim</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{tokenList.map(t => 
						<Stake web3={web3} accounts={accounts} contract={contract} id={tokenList.indexOf(t)} address={t} setUnstakedToken={unstakeToken} unstakedToken={unstakedToken} stakedOnly={stakedOnly} stakedToken={stakedToken} setGetRewardedToken={rewardeToken} rewardedToken={rewardedToken} />
					)}
				</tbody>
				</Table>
			</Card.Body>
		</Card>
	</>
}

function useToggle(initialValue = true){
	const [value,setValue] = useState(initialValue);
	const toggle = function () {
		setValue(v => !v);
	}
	return [value,toggle];
}


function Stake({web3, id, address, accounts, contract, setUnstakedToken, unstakedToken, stakedOnly, stakedToken, setGetRewardedToken, rewardedToken}){
	const [tokenName, setTokenName] = useState("");
	const [tokenDecimals, setTokenDecimals] = useState("");
	const [totalTokenSupply, setTotalTokenSupply] = useState(0);
	const [stake, setStake] = useState(null);
	const [disable, setDisable] = useState(true);
	const [rewardsToClaim,setRewardsToClaim] = useState(0);
	

	//Get the token name from ERC20
	useEffect(function(){
		(async function(){
			if(address){
				const token = new web3.eth.Contract(ERC20.abi, address);
				const _tokenName = await token.methods.name().call();
				const _tokenDecimals = await token.methods.decimals().call();
				const _totalTokenSupply = await contract.methods.totalTokenSupply(address).call();
				setTokenName(_tokenName);
				setTokenDecimals(_tokenDecimals);
				setTotalTokenSupply(_totalTokenSupply);
			}
		})();
	},[stakedOnly, stakedToken]);

	//Get the Stake struct from SC
	useEffect(function(){
		(async function(){
			if(address){
				const _stake = await contract.methods.stakes(address,accounts[0]).call();
				//By default print only staked token
				if(_stake.staked || _stake.rewards > 0){ 
					setStake(_stake);
					setDisable(false);
					console.log(_stake);
				//But you could want to see others possibilities
				} else if (!stakedOnly){
					setStake(_stake);
					setDisable(true);
					console.log(_stake);
				}
			}
		})();
	},[stakedOnly, stakedToken, rewardedToken]);

	

	//Print rewards to claim
	useEffect(function(){
		const timer = window.setInterval(async function(){
			if(address){
				const _rewardPerStake = parseInt(await contract.methods.calcRewardPerStake(address,accounts[0]).call(),10);
				console.log(_rewardPerStake);

				setRewardsToClaim(_rewardPerStake);
			}
		},1000);

		//A chaque fois qu'on a un timer, un abonnement à des événements etc. on doit gérer le clear immédiamement.
		return function(){
			clearInterval(timer);
		};
	},[]);


	//Handle the unstake button (callback for the top component as we want an impact direct of the token list print)
	const handleUnstake = async function(e){
		e.preventDefault();
		if(stake.stakingAmount > 0){
			await setUnstakedToken(address);
		}
	};

	//Handle the get rewards button
	const handleRewards = async (e) => {
		e.preventDefault();
		if(stake.stakingAmount > 0){
			await setGetRewardedToken(address);
		}
	};

	if(stake == null){
		return <></>
	}


	const startTs = timeSince(stake.startStakingTimestamp);
	const updateTs = timeSince(stake.updateTimestamp);
	let calc = parseInt(stake.rewards,10) + rewardsToClaim;
	
	//TODO tooltips for help
	//TODO TVL
	return <>
		{(stake.staked || !stakedOnly) && <tr key={id}>
		<td>{id}</td>
		<td>{address}</td>
		<td>{tokenName}</td>
		<td>{Math.floor(stake.stakingAmount/10**tokenDecimals)} / {Math.floor(totalTokenSupply/10**tokenDecimals)}</td>
		<td>{stake.startStakingTimestamp == 0 ? "N/A" : startTs}</td>
		<td>{stake.updateTimestamp == 0 ? "N/A" : updateTs}</td>
		<td>{calc}</td>
		<td className="d-grid gap-3">
			<Stack gap={3} direction="horizontal">
				<Button className="ms-auto" onClick={handleUnstake} variant={disable?"secondary":"primary"} size="sm" disabled={disable}> Unstake </Button>
				<div className="vr" />
				<Button className="me-auto" onClick={handleRewards} variant={disable?"secondary":"primary"} size="sm" disabled={disable}> Get rewards </Button>
			</Stack>
		</td>
	</tr>
	}
	</>
}