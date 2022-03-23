import React, { useState, useEffect } from "react";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

/* const enumContent = [
	"RegisteringVoters",
	"ProposalsRegistrationStarted",
	"ProposalsRegistrationEnded",
	"VotingSessionStarted",
	"VotingSessionEnded",
	"VotesTallied"
]; */

export default function Navigation({handleConnect, web3, accounts, contract}){
	/* const [wfStatus,setLocalStatus] = useState(0); */

/* 	useEffect(function(){
		const timer = window.setInterval(function(){
			(async function(){
				if(contract){
					const actualStatus = await contract.methods.wfStatus().call();
					setLocalStatus(actualStatus);
					setStatus(actualStatus);
				}		
			})();
		},1000);
		return function(){
			clearInterval(timer);
		};
	},[contract]); */


	return <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
		<Container>
		<Navbar.Brand href="#home">My Stacking Dapp</Navbar.Brand>
		<Navbar.Toggle aria-controls="responsive-navbar-nav" />
		{web3===null ? <button className="btn btn-primary ms-auto" onClick={handleConnect}>Connect</button> :
			<Navbar.Collapse id="responsive-navbar-nav">
				{/* <Nav>
					<Navbar.Text>
						Actual status : {enumContent[wfStatus]}
					</Navbar.Text>
				</Nav> */}
				<Nav className="ms-auto" >
					<Navbar.Text >
						Connected with : {accounts[0].substr(0,5)+" ... "+accounts[0].substr(accounts[0].length - 4)}
					</Navbar.Text>
				</Nav>
			</Navbar.Collapse>
		}
		</Container>
	</Navbar>
}