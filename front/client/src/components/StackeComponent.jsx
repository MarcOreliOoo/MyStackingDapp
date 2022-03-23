import React, { useState, useRef, useEffect } from "react";
import ProposalsList from "./ProposalsList";
import FormField from "../utils/FormField";
import CardComponent from "../utils/CardComponent";
import AlertComponent from "../utils/AlertComponent";
import EventComponent from "./EventComponent";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function StackeComponent({web3, accounts, contract}){
	const formStakingCreation = useRef(null);
	const [error,setError] = useState(null);
	
	const [isRegistered,setIsRegistered] = useState(false);
	
	//Stake an amount of en ERC20 token
	const registeringStaking = async () => {
		const proposalToken = formStakingCreation.current.token.value;
		const proposalAmount = formStakingCreation.current.amount.value;
		if(proposalToken.trim() !== ''){
			await contract.methods.stake(proposalToken,proposalAmount).send({from: accounts[0]})
			.on("receipt",function(receipt){
				formStakingCreation.current.token.value = "0x...";
				formStakingCreation.current.amount.value = "";
			})
			.on("error",function(error){
				const parsedError = JSON.stringify(error.message);
				if (parsedError.includes('revert ')) {
					setError(parsedError);
				}
			});
		}
	};


	return <>
		<div className="container mt-4">
			<Row>
				{error && <AlertComponent>{error}</AlertComponent>}
			</Row>
			<Row>
				<Col>
					<CardComponent title="Stake your token" >
						<Form ref={formStakingCreation}>
							<FormField name="token" label="ERC20 Token :" placeholder="0x..." />
							<FormField name="amount" label="Amount with decimals :" />
						</Form>
						<Button onClick={registeringStaking} type="submit" variant="secondary" size="sm"> Go </Button>
					</CardComponent>
				</Col>
				<Col md="auto">
					{/* <ProposalsList accounts={accounts} contract={contract} wfStatus={wfStatus} isRegistred={isRegistered} hasVoted={hasVoted} setHasVoted={setHasVoted} /> */}
				</Col>
			</Row>
			<Row><EventComponent contract={contract} /></Row>
		</div>
	</>
}