import React, { useState, useEffect } from "react";
import timeSince from "../utils/timeSince";
import ToastContainer from 'react-bootstrap/ToastContainer';
import Toast from 'react-bootstrap/Toast';

export default function EventComponent({contract}){

	const [eventEmitted,setEventEmitted] = useState();
	const [dateTime,setDateTime] = useState(Date.now());
	const [show,setShow] =  useState(false); //Toast isnt printing by default

//	const [listVoters, setlistVoters] = 

	useEffect(function(){
		if(contract){
			const timer = window.setInterval(function(){
				contract.once(
					"allEvents",
					function(error, event){
						if(event.event == "VoterRegistered") {
							setEventEmitted({
								eventEmittedName:event.event,
								eventEmittedContent:event.returnValues.voterAddress
							});
							setDateTime(Date.now());
							setShow(true);
						} else if (event.event == "WorkflowStatusChange"){
							setEventEmitted({
								eventEmittedName:event.event,
								eventEmittedContent:"From "+event.returnValues.previousStatus + " to " +event.returnValues.newStatus
							});
							setDateTime(Date.now());
							setShow(true);
						} else if (event.event == "ProposalRegistered"){
							setEventEmitted({
								eventEmittedName:event.event,
								eventEmittedContent:"Proposal "+event.returnValues.proposalId + " registred !"
							});
							setDateTime(Date.now());
							setShow(true);
						} else if (event.event == "Voted"){
							setEventEmitted({
								eventEmittedName:event.event,
								eventEmittedContent:"Voter "+event.returnValues.voter + " voted for "+event.returnValues.proposalId
							});
							setDateTime(Date.now());
							setShow(true);
						}
					}
				);
			},1000);
			return function(){
				clearInterval(timer);
			};
		}
	},[]);

	//It works too
	/* useEffect(function(){
		if(contract){
			const timer = window.setInterval(function(){
				contract.events.VoterRegistered().on("data",function(event){
					setEventEmitted({
						eventEmittedName:event.event,
						eventEmittedContent:event.returnValues.voterAddress
					});
					setDateTime(Date.now());
					setShow(true);//Toast to print
				});
			},1000);
			return function(){
				clearInterval(timer);
			};
		}
	},[]); */

	return <>{eventEmitted &&
		<ToastContainer position="top-end" className="p-3">
			<Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
				<Toast.Header>
					<strong className="me-auto">{eventEmitted.eventEmittedName}</strong>
					<small className="text-muted">{timeSince(dateTime)}</small>
				</Toast.Header>
				<Toast.Body>{eventEmitted.eventEmittedContent}</Toast.Body>
			</Toast>
		</ToastContainer>}
	</>
}
