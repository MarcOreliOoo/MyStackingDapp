import React, { useState, useEffect } from "react";
import timeSince from "../utils/timeSince";
import ToastContainer from 'react-bootstrap/ToastContainer';
import Toast from 'react-bootstrap/Toast';

export default function EventComponent({contract}){

	const [eventEmitted,setEventEmitted] = useState();
	const [dateTime,setDateTime] = useState(Date.now());
	const [show,setShow] =  useState(false); //Toast isnt printing by default

	useEffect(function(){
		if(contract){
			const timer = window.setInterval(function(){
				contract.once(
					"allEvents",
					function(error, event){
						if(event.event == "Staking") {
							console.log("event")
							setEventEmitted({
								eventEmittedName:event.event,
								eventEmittedContent:event.returnValues.stakerAddress + " staked " + event.returnValues.amountToStake + " of " + event.returnValues.stakingToken
							});
							setDateTime(Date.now());
							setShow(true);
						} else if (event.event == "Unstaking"){
							setEventEmitted({
								eventEmittedName:event.event,
								eventEmittedContent:event.returnValues.stakerAddress + " unstaked " + event.returnValues.amountToUnstake + " of " + event.returnValues.stakingToken
							});
							setDateTime(Date.now());
							setShow(true);
						} else if (event.event == "Rewarding"){
							setEventEmitted({
								eventEmittedName:event.event,
								eventEmittedContent:event.returnValues.stakerAddress + " get rewarded of " + event.returnValues.rewards + " " + event.returnValues.stakingToken
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
