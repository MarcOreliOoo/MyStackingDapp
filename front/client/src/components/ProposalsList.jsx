import React, { useState, useEffect } from "react";
import CardComponent from "../utils/CardComponent";
import sortArrayByKey from "../utils/sortArrayByKey";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';


/**
 * Component proposalsList
 * @param {[]} accounts : account[0] = account connected on metamask 
 * @param {contract} contract : contract Voting
 * @param {int} wfStatus: status of the dapp
 * @param {boolean} isRegistred : helper if not registred voter cannot participate
 * @param {boolean} hasVoted : helper to disable button once voted
 * @param {callback} setHasVoted : callback @see setHasVoted
 * @returns a line from the table of the card component depending of the status of the Dapp
 */
export default function ProposalsList({accounts, contract, wfStatus, isRegistred, hasVoted, setHasVoted}){
	const [proposalsList, setProposalsList] = useState([]);
	const [loading, setLoading] = useState(true); //Par défaut est en train de charger
	const [disable,setDisable] = useState(false);
	const [winner,setWinner] = useState(null);
	

	/**
	 * Get the proposal list to print
	 */
	useEffect(function(){
		(async function(){
			if(contract){
				const response = await contract.methods.getProposalsList().call();
				setProposalsList(response);
				setLoading(false);
			}
		})();
	},[proposalsList]);

	/**
	 * Get helper : disable if already voted
	 */ 
	useEffect(function(){
		setDisable(hasVoted);
	},[hasVoted]);

	/**
	 * Get the winning proposal on a useEffect to get it when wfStatus change
	 */
	useEffect(function(){
		if(wfStatus == 5){
			(async function(){
				const response = await contract.methods.getWinner().call();
				setWinner(response);
				
				if(winner && proposalsList.length>0){
					console.log("ici")
					let listP = sortArrayByKey(proposalsList,proposalsList.voteCount)
					setProposalsList(listP);
				}
			})();
		}
	},[wfStatus]);

	/**
	 * Voting for the proposal selected with button
	 * @param {int} id 
	 */
	const votingFor = async (id) => {
		if(contract && isRegistred && !hasVoted && proposalsList.length >= id){
			await contract.methods.votingFor(id).send({from: accounts[0]})
			.on("receipt",function(receipt){
				setDisable(true);
				setHasVoted(true);
			})
			.on("error",function(error){
				console.log(error);
			});
		}
	};


	if (loading || proposalsList.length==0){
		return <></>;
	}
	return <>
		<CardComponent title="List of proposals">
			<Table striped bordered hover size="sm" responsive="sm" >
			<thead>
				<tr>
					<th>#</th>
					<th>Proposal description</th>
					{wfStatus == 3 && <th>Proposal voting</th>}
					{wfStatus == 5 && winner && <th>Proposal count</th>}
				</tr>
			</thead>
			<tbody>
				{proposalsList.map(p => 
					<tr key={proposalsList.indexOf(p)+1}>
						<Proposal id={proposalsList.indexOf(p)+1} proposal={p} wfStatus={wfStatus} onVote={votingFor} disable={disable} winner={winner} />
					</tr>
				)}
			</tbody>
			</Table>
		</CardComponent>
	</>
}

/**
 * Component proposal
 * @param {int} id : id of the proposalListIndex 
 * @param {proposal} proposal : the proposal from the list
 * @param {int} wfStatus: status of the dapp
 * @param {onVote} onVote : callback @see votingFor
 * @param {boolean} disable : helper to disable button once voted
 * @param {proposal} winner : winner of the proposalList @see useEffect getWinner
 * @returns a line from the table of the card component depending of the status of the Dapp
 */
function Proposal({id, proposal, wfStatus, onVote, disable, winner}){
	const handleVoting = async function(e){
		e.preventDefault();
		await onVote(id-1);
	}

	/**
	 * If status is VotingSessionStarted == 3, print a button to vote for each proposal, disable if already voted
	 * If status is VotesTallied == 5, print a badge for each proposal, green for winner, secondary for others
	 */
	return <>
		<td>{id}</td>
		<td>{proposal.description}</td>
		{wfStatus == 3 && 
			<td className="d-grid gap-2">
				<Button onClick={handleVoting} variant="secondary" size="sm" disabled={disable}> Vote </Button>
			</td>
		}
		{wfStatus == 5 && winner &&
			<td className="d-grid gap-2">
				<Badge pill bg={id-1 == winner[0] ? "success" : "secondary"}>{proposal.voteCount}</Badge>
			</td>
		}
	</>
}

