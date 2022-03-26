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
						<Stake web3={web3} accounts={accounts} contract={contract} id={tokenList.indexOf(t)} address={t} setUnstakedToken={unstakeToken} stakedOnly={stakedOnly} stakedToken={stakedToken}/>
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


function Stake({web3, id, address, accounts, contract, setUnstakedToken, stakedOnly, stakedToken}){
	const [tokenName, setTokenName] = useState("");
	const [tokenDecimals, setTokenDecimals] = useState("");
	const [totalTokenSupply, setTotalTokenSupply] = useState(0);
	const [stake, setStake] = useState(null);
	const [disable, setDisable] = useState(true);
	

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
	},[stakedOnly, stakedToken]);

	//totalTokenSupply

	/* //Print rewards to claim
	useEffect(function(){
		(async function(){
			if(address){
				
				//{stake.rewards}

				setTokenName(_tokenName);
				setTokenDecimals(_tokenDecimals);
			}
		})();
	},[]); */


	//Handle the unstake button (callback for the top component as we want an impact direct of the token list print)
	const handleUnstake = async function(e){
		e.preventDefault();
		if(stake.stakingAmount > 0){
			await setUnstakedToken(address);
		}
	};

	//Handle the get rewards button
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


	

	const startTs = timeSince(stake.startStakingTimestamp);
	const updateTs = timeSince(stake.updateTimestamp);
	
	//TODO get rewards to claimed
	//TODO totalSupply of that tokken + tooltips for help
	//TODO TVL
	return <>
		{(stake.staked || !stakedOnly) && <tr key={id}>
		<td>{id}</td>
		<td>{address}</td>
		<td>{tokenName}</td>
		<td>{stake.stakingAmount/10**tokenDecimals} / {totalTokenSupply/10**tokenDecimals}</td>
		<td>{stake.startStakingTimestamp == 0 ? "N/A" : startTs}</td>
		<td>{stake.updateTimestamp == 0 ? "N/A" : updateTs}</td>
		<td>{stake.rewards}</td>
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