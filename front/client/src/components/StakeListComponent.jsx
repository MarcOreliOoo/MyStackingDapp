import React, { useState, useEffect } from "react";
import ERC20 from "../contracts/ERC20.json";
import Card from "react-bootstrap/Card";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
import time from "../utils/time";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function StakeListComponent({web3, accounts, contract, stakedToken}){
	const [loading, setLoading] = useState(true); //By default is loading
	const [tokenList, setTokenList] = useState([]);
	const [allStakesVisible,toggleStakes] = useToggle();
	const [unstakedToken, setUnstakedToken] = useState("");

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
	},[stakedToken,unstakedToken, allStakesVisible]);

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
	
	if (loading){//|| tokenList.length==0
		return <></>;
	}
	return <>
		<Card>
			<Card.Header >
				<Stack gap={2} direction="horizontal">
					<div className="me-auto h5">Staking</div>
					<Form><Form.Check type="switch" id="custom-switch" label="Staked only" onChange={toggleStakes} checked={allStakesVisible}/></Form>
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
						<th>Since</th>
						<th>Last update</th>
						<th>Rewards stocked</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{tokenList.map(t => 
						<tr key={tokenList.indexOf(t)}>
							<Stake web3={web3} accounts={accounts} contract={contract} id={tokenList.indexOf(t)} address={t} setUnstakedToken={unstakeToken} allStakesVisible={allStakesVisible} />
						</tr>
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
		console.log(value);
	}
	return [value,toggle];
}


function Stake({web3, id, address, accounts, contract, setUnstakedToken, allStakesVisible}){
	const [tokenName, setTokenName] = useState("");
	const [tokenDecimals, setTokenDecimals] = useState("");
	const [stake, setStake] = useState(null);
	const [disable, setDisable] = useState(true);

	//Get the token name from ERC20
	useEffect(function(){
		(async function(){
			if(address){
				const token = new web3.eth.Contract(ERC20.abi, address);
				const _tokenName = await token.methods.name().call();
				const _tokenDecimals = await token.methods.decimals().call();
				setTokenName(_tokenName);
				setTokenDecimals(_tokenDecimals);
			}
		})();
	},[]);

	//Get the Stake struct from SC
	useEffect(function(){
		(async function(){
			if(address){
				const _stake = await contract.methods.stakes(address,accounts[0]).call();
				if(_stake.staked || _stake.rewards > 0 || !allStakesVisible){
					setStake(_stake);
					setDisable(false);
					console.log(_stake);
				}
			}
		})();
	},[allStakesVisible]);

	const handleRestake = async function(e){
		e.preventDefault();
	}

	const handleUnstake = async function(e){
		e.preventDefault();
		if(stake.stakingAmount > 0){
			await setUnstakedToken(address);
		}
	};

	const handleRewards = async () => {
		if(stake.stakingAmount > 0){
			await contract.methods.getReward(address).send({from: accounts[0]})
			.on("receipt",function(receipt){
				console.log(receipt);
			})
			.on("error",function(error){
				console.log(error);
			});
		}
	};

	if(stake == null){
		return <></>
	}
	//TODO timeSince and time doesnt work
	return <>
		<td>{id}</td>
		<td>{address}</td>
		<td>{tokenName}</td>
		<td>{stake.stakingAmount/10**tokenDecimals}</td>
		<td>{time(stake.startStakingTimestamp)}</td>
		<td>{time(stake.updateTimestamp)}</td>
		<td>{stake.rewards}</td>
		<td className="d-grid gap-4">
			<ButtonGroup size="sm">
				<Button onClick={handleRestake} variant="primary" size="sm"> Stake more </Button>
				<Button onClick={handleUnstake} variant={disable?"secondary":"primary"} size="sm" disabled={disable}> Unstake </Button>
				<Button onClick={handleRewards} variant={disable?"secondary":"primary"} size="sm" disabled={disable}> Get rewards </Button>
			</ButtonGroup>
		</td>
	</>
}

