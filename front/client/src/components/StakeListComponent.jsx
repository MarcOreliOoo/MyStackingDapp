import React, { useState, useEffect } from "react";
import CardComponent from "../utils/CardComponent";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';



export default function StakeListComponent({accounts, contract}){
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
	return <>
		<CardComponent title="Staking">
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
					<th>Stake</th>
					<th>Unstake</th>
					<th>Get rewards</th>
				</tr>
			</thead>
			<tbody>
				{tokenList.map(t => 
					<tr key={tokenList.indexOf(t)}>
						<Stake id={tokenList.indexOf(t)} token={t} />
					</tr>
				)}
			</tbody>
			</Table>
		</CardComponent>
	</>
}


function Stake({id, token}){

	const handleRewards = async function(e){
		e.preventDefault();
	}

	return <>
		<td>{id}</td>
		<td>{token}</td>
		<td>{token}</td>
		<td>Quantity</td>
		<td>Since</td>
		<td>Last update</td>
		<td>Rewards stocked</td>
		<td>
			<Button onClick={handleRewards} variant="secondary" size="sm"> Stake more </Button>
		</td>
		<td>
			<Button onClick={handleRewards} variant="secondary" size="sm"> Unstake </Button>
		</td>
		<td className="d-grid gap-2">
			<Button onClick={handleRewards} variant="secondary" size="sm"> Get rewards </Button>
		</td>
	</>
}

