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

export default function VotersComponent({web3, accounts, contract, wfStatus}){
	const formProposalCreation = useRef(null);
	const [error,setError] = useState(null);
	const [hasVoted,setHasVoted] = useState(false);
	const [isRegistered,setIsRegistered] = useState(false);
	
	//Voter status
	useEffect(function(){
		if(contract && accounts[0]){
			(async function(){
				const voter = await contract.methods.getWhitelistedVoter(accounts[0]).call();
				if(voter){
					setHasVoted(voter.hasVoted);
					setIsRegistered(voter.isRegistered);
				}
			})();
		}
	},[wfStatus,accounts]);

	
	//create a proposal
	const registeringProposal = async () => {
		if(isRegistered){
			const proposalToRegistred = formProposalCreation.current.proposal.value;
			if(proposalToRegistred.trim() !== ''){
				await contract.methods.registeringProposal(proposalToRegistred).send({from: accounts[0]})
				.on("receipt",function(receipt){
					formProposalCreation.current.proposal.value = "";
				})
				.on("error",function(error){
					const parsedError = JSON.stringify(error.message);
					if (parsedError.includes('revert ')) {
						setError(parsedError);
					}
				});
			}
		}
	};


	return <>
		<div className="container mt-4">
			<Row>
				{error && <AlertComponent>{error}</AlertComponent>}
			</Row>
			<Row>
				{wfStatus == 1 && isRegistered &&
					<Col>
						<CardComponent title="Make your proposal" >
							<Form ref={formProposalCreation}>
								<FormField name="proposal" label="Proposal :" placeholder="I would like to..." />
							</Form>
							<Button onClick={registeringProposal} type="submit" variant="secondary" size="sm"> Go </Button>
						</CardComponent>
					</Col>
				}
				<Col md="auto">
					<ProposalsList accounts={accounts} contract={contract} wfStatus={wfStatus} isRegistred={isRegistered} hasVoted={hasVoted} setHasVoted={setHasVoted} />
				</Col>
			</Row>
			<Row><EventComponent contract={contract} /></Row>
		</div>
	</>
}