import React, { useState, useRef } from "react";
import VotersList from "./VotersList";
import FormField from "../utils/FormField";
import CardComponent from "../utils/CardComponent";
import AlertComponent from "../utils/AlertComponent";
import EventComponent from "./EventComponent";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';




export default function AdminComponent({web3, accounts, contract, isOwner, wfStatus}){
	const formAddress = useRef(null);
	const [error,setError] = useState(null);
	const [nbVote,setNbVote] = useState(0);
	const [forceReload,setForceReload] = useState(false);

	/**
	 * Registering voters
	 * First step : get the state of react of the formAddress with a useRef
	 * Second step : if the input value is a valid address, then send the transaction
	 * Third step : promise, if receipt update the input value of formAddress, if not, submit an error to the console and the AlertComponent error.
	 */
	const registeringVoters = async () => {
		const voterToregistred = formAddress.current.address.value;
		if(voterToregistred.trim() !== '' && web3.utils.isAddress(voterToregistred)){
			await contract.methods.registeringUniqueAd(voterToregistred).send({from: accounts[0], handleRevert:true})
			.on("receipt",function(receipt){
				formAddress.current.address.value = "";
			})
			.on("error",function(error){
				const parsedError = JSON.stringify(error.message);
				if (parsedError.includes('revert ')) {
					setError(parsedError);
				}
			});
		}
	};
    
	/**
	 * Starting the proposal session
	 * First step : call the proposal session
	 * Second step : promise, if receipt log receipt, if not, submit an error to the AlertComponent error.
	 */
	const startingProposalSession = async () => {
		await contract.methods.startingProposalSession().send({from: accounts[0]})
		.on("receipt",function(receipt){
			console.log(receipt);
		})
		.on("error",function(error){
			setError(error);
		});
    };

	/**
	 * Ending the proposal session
	 * First step : call the method
	 * Second step : promise, if receipt log receipt, if not, submit an error to the AlertComponent error.
	 */
	const endingProposalSession = async () => {
		await contract.methods.endingProposalSession().send({from: accounts[0]})
		.on("receipt",function(receipt){
			console.log(receipt);
		})
		.on("error",function(error){
			setError(error);
		});
    };

	/**
	 * Starting the voting session
	 * First step : call the method
	 * Second step : promise, if receipt log receipt, if not, submit an error to the AlertComponent error.
	 */
	const startVotingSession = async () => {
		await contract.methods.startVotingSession().send({from: accounts[0]})
		.on("receipt",function(receipt){
			console.log(receipt);
		})
		.on("error",function(error){
			setError(error);
		});
    };

	/**
	 * Ending the vote session
	 * First step : if the number of vote is >0 then call the method
	 * Second step : promise, if receipt log receipt, if not, submit an error to the AlertComponent error.
	 */
	const endVotingSession = async () => {
		const nb = await contract.methods.nbVote().call();
		setNbVote(nb);
		if(nb>0){
			await contract.methods.endVotingSession().send({from: accounts[0]})
			.on("receipt",function(receipt){
				console.log(receipt);
			})
			.on("error",function(error){
				setError(error);
			});
		} else {setError("Not enough vote");}
    };

	/**
	 * Count the vote session
	 * First step : call the method
	 * Second step : promise, if receipt log receipt, if not, submit an error to the AlertComponent error.
	 */
	const countVote = async () => {
		await contract.methods.countVote().send({from: accounts[0]})
		.on("receipt",function(receipt){
			console.log(receipt);
		})
		.on("error",function(error){
			setError(error);
		});
    };

	/**
	 * Re start the app from scratch for a new proposal session
	 * First step : call the method
	 * Second step : promise, if receipt log receipt, if not, submit an error to the AlertComponent error.
	 */
	const reInitStatus = async () => {
		await contract.methods.reInitStatus().send({from: accounts[0]})
		.on("receipt",function(receipt){
			console.log(receipt);
		})
		.on("error",function(error){
			setError(error);
		});
		setForceReload(true);
    };

	
	return(
		<div className="container mt-4">
		<Row>
			{error && <AlertComponent>{error}</AlertComponent>}
		</Row>
		<Row>
			{wfStatus == 0 && isOwner &&
				<Col>
					<CardComponent title="Whitelist an address" >
						<Form ref={formAddress}>
							<FormField name="address" label="Address :" placeholder="0x..." />
						</Form>
						<div className="d-grid gap-2"><Button onClick={registeringVoters} type="submit" variant="secondary" size="sm"> Go </Button></div>
					</CardComponent>
				</Col>
			}
			{wfStatus == 0 && isOwner && 
				<Col>
					<CardComponent title="Start proposal session" >
						<div className="d-grid gap-2"><Button onClick={startingProposalSession} type="submit" variant="secondary" size="sm"> Go </Button></div>
					</CardComponent>
				</Col>
			}
			{wfStatus == 1 && isOwner && 
				<Col>
					<CardComponent title="End proposal session" >
						<div className="d-grid gap-2"><Button onClick={endingProposalSession} type="submit" variant="secondary" size="sm"> Go </Button></div>
					</CardComponent>
				</Col>
			}
			{wfStatus == 2 && isOwner &&
				<Col>
					<CardComponent title="Start voting session" >
						<div className="d-grid gap-2"><Button onClick={startVotingSession} type="submit" variant="secondary" size="sm"> Go </Button></div>
					</CardComponent>
				</Col>
			}
			{wfStatus == 3 && isOwner && 
				<Col>
					<CardComponent title="End voting session" >
						<div className="d-grid gap-2"><Button onClick={endVotingSession} type="submit" variant="secondary" size="sm"> Go </Button></div>
					</CardComponent>
				</Col>
			}
			{wfStatus == 4 && isOwner && 
				<Col>
					<CardComponent title="Count vote" >
						<div className="d-grid gap-2"><Button onClick={countVote} type="submit" variant="secondary" size="sm"> Go </Button></div>
					</CardComponent>
				</Col>
			}
			{wfStatus == 5 && isOwner && 
				<Col>
					<CardComponent title="Re Init App" >
						<div className="d-grid gap-2"><Button onClick={reInitStatus} type="submit" variant="secondary" size="sm"> Go </Button></div>
					</CardComponent>
				</Col>
			}
			<Col md="auto">
				<VotersList accounts={accounts} contract={contract} isOwner={isOwner} wfStatus={wfStatus}/>
			</Col>
		</Row>
		<Row><EventComponent contract={contract} /></Row>
		</div>
	);
}