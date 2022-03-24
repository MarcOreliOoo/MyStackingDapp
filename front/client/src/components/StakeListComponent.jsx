import React, { useState, useEffect } from "react";
import ERC20 from "../contracts/ERC20.json";
import Card from "react-bootstrap/Card";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
import timeSince from "../utils/timeSince";


export default function StakeListComponent({web3, accounts, contract}){
	const [loading, setLoading] = useState(true); //By default is loading
	const [tokenList, setTokenList] = useState([]);
	const [stakes, setStakes] = useState({});

	useEffect(function(){
		(async function(){
			if(contract){
				const response = await contract.methods.getTokenList().call();
				setTokenList(response);
				setLoading(false);
			}
		})();
	},[tokenList]);


	if (loading || tokenList.length==0){
		return <></>;
	}
	return <div className="container mt-4">
		<Card>
			<Card.Header >
				<Stack gap={2} direction="horizontal">
					<div className="me-auto h5">Staking</div>
					<Form><Form.Check type="switch" id="custom-switch" label="Staked only" /></Form>
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
							<Stake web3={web3} id={tokenList.indexOf(t)} address={t} accounts={accounts} contract={contract} />
						</tr>
					)}
				</tbody>
				</Table>
			</Card.Body>
		</Card>
	</div>
}


function Stake({web3, id, address, accounts, contract}){
	const [tokenName, setTokenName] = useState("");
	const [tokenDecimals, setTokenDecimals] = useState("");
	const [stake, setStake] = useState(null);
	const [toogle,setToogle] = useState(true);

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
				console.log(accounts[0]);
				const _stake = await contract.methods.stakes(address,accounts[0]).call();
				if(_stake.staked || toogle){
					setStake(_stake);
					console.log(_stake);
				}
			}
		})();
	},[]);
	

	const handleRewards = async function(e){
		e.preventDefault();
	}

	if(stake == null){
		return <></>
	}
	return <>
		<td>{id}</td>
		<td>{address}</td>
		<td>{tokenName}</td>
		<td>{stake.stakingAmount/10**tokenDecimals}</td>
		<td>{timeSince(stake.startStakingTimestamp)}</td>
		<td>{timeSince(stake.updateTimestamp)}</td>
		<td>{stake.rewards}</td>
		<td className="d-grid gap-4">
			<ButtonGroup size="sm">
				<Button onClick={handleRewards} variant="primary" size="sm"> Stake more </Button>
				<Button onClick={handleRewards} variant="primary" size="sm"> Unstake </Button>
				<Button onClick={handleRewards} variant="primary" size="sm"> Get rewards </Button>
			</ButtonGroup>
		</td>
	</>
}

