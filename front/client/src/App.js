import React, { useState, useCallback, useEffect } from "react";
import Container from 'react-bootstrap/Container';
import myStackingDapp from "./contracts/myStackingDapp.json";
import getWeb3 from "./utils/getWeb3";
import Navigation from "./components/Navigation";
import StackingComponent from "./components/StackingComponent";
import EventComponent from "./components/EventComponent";


import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';



/**
 * Entry point of the dapp
 */
export default function App() {
	/**
	 * Some state : web3, accounts, contracts for interaction with the solidity contract
	 * Some state : isOwner and wfStatus : global state used almost everywhere so we need to the parent component of all to spread its value for all
	 */
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState([""]);
    const [contract, setContract] = useState(null);
	const [tokenUpd, setTokenUpd] = useState(false);
	
	//Handler of connection
	const handleConnect = useCallback (async function () {
		try {
			// Get network provider and web3 instance.			
			const web3 = await getWeb3();
			// Use web3 to get the user's accounts.
			const accounts = await web3.eth.getAccounts();
			//const accounts = await window.ethereum.request({method: 'eth_accounts'});

			// Get the contract instance.
			const networkId = await web3.eth.net.getId();
			const deployedNetwork = myStackingDapp.networks[networkId];
			//const revertB = web3.eth.Contract.handleRevert.true;

			const contract = new web3.eth.Contract(myStackingDapp.abi, deployedNetwork && deployedNetwork.address);
						
			// Set web3, accounts, contract to the state
			setWeb3(web3);
			setContract(contract);
			setAccounts(accounts);
			
		} catch (error) {
			// Catch any errors for any of the above operations
			alert(`Failed to load web3, accounts, or contract. Did you migrate the contract or install MetaMask? Check console for details.`,);
			console.error(error);
		}
	},[]);

	//If there is a metamask change for accounts, reload the webpage
	useEffect(function(){
		window.ethereum.on('accountsChanged', function (accounts) {
			window.location.reload();
		  });
	},[]);

	//If there is a metamask chain change, reload the webpage
	useEffect(function(){
		window.ethereum.on('chainChanged', (chainId) => {
			window.location.reload();
		});
	},[]);

/**
 * - Container fluid for the global look
 * - Navigation is our main navigation component for connect and print some global info for the user
 * - If owner of the contract is connected, AdminComponent is visible
 * - Owner or voter see the VotersComponent anyway
 */
	return (
		<Container fluid>
			<Navigation handleConnect={handleConnect} web3={web3} accounts={accounts} contract={contract} />
			<EventComponent contract={contract} />
			<Container>
				{contract && <StackingComponent web3={web3} accounts={accounts} contract={contract} />}
			</Container>
		</Container>
	);
}
