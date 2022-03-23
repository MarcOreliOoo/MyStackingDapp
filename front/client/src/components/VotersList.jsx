import React, { useState, useEffect } from "react";
import CardComponent from "../utils/CardComponent";
import Table from 'react-bootstrap/Table';

export default function VotersList({accounts, contract, isOwner,wfStatus }){
	const [votersList, setVotersList] = useState([]);
	const [loading, setLoading] = useState(true); //Par défaut est en train de charger


	useEffect(function(){
		(async function(){
			if(contract && isOwner){
				const response = await contract.methods.getWhitelist().call({from: accounts[0]});
				setVotersList(response);
				setLoading(false); //On a fini le chargement
			}
		})();
	},[votersList,wfStatus]);



	if (loading){
		return 'Chargement...';
	}
	if(votersList.length==0){
		return <></>
	}
	return <CardComponent title="Whitelist of Voters">
		<Table striped bordered hover size="sm" >
		<thead>
			<tr>
				<th>Voters</th>
			</tr>
		</thead>
		<tbody>
			{votersList.map(v => <tr key={v}><td>{v}</td></tr>)}
		</tbody>
		</Table>
	</CardComponent>
	
}