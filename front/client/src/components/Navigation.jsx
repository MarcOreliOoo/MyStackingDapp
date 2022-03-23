import React, { useState, useEffect } from "react";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';


export default function Navigation({handleConnect, web3, accounts, contract}){
	const [aalTokenContract,setAalTokenContract] = useState("");

 	useEffect(function(){
		(async function(){
			if(contract){
				const aaltknctr = await contract.methods.rewardsToken().call();
				setAalTokenContract(aaltknctr);
			}		
		})();
	},[contract]);


	return <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
		<Container>
		<Navbar.Brand href="#home">My Stacking Dapp</Navbar.Brand>
		<Navbar.Toggle aria-controls="responsive-navbar-nav" />
		{web3===null ? <button className="btn btn-primary ms-auto" onClick={handleConnect}>Connect</button> :
			<Navbar.Collapse id="responsive-navbar-nav">
				<Nav>
					<Navbar.Text>
						AAL Token : {aalTokenContract}
					</Navbar.Text>
				</Nav>
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