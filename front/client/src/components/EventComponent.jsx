import React, { useState, useEffect } from "react";
import timeSinceJS from "../utils/timeSince";
import ToastContainer from 'react-bootstrap/ToastContainer';
import Toast from 'react-bootstrap/Toast';
import addressFormatHelper from '../utils/addressFormatHelper';

export default function EventComponent({contract}){

	const [eventEmitted,setEventEmitted] = useState();
	const [dateTime,setDateTime] = useState(Date.now());
	const [show,setShow] =  useState(true); //Toast isnt printing by default

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
								eventEmittedContent:addressFormatHelper(event.returnValues.stakerAddress) + " staked " + event.returnValues.amountToStake + " of " + addressFormatHelper(event.returnValues.stakingToken)
							});
							setDateTime(Date.now());
							setShow(true);
						} else if (event.event == "Unstaking"){
							setEventEmitted({
								eventEmittedName:event.event,
								eventEmittedContent:addressFormatHelper(event.returnValues.stakerAddress) + " unstaked " + event.returnValues.amountToUnstake + " of " + addressFormatHelper(event.returnValues.stakingToken)
							});
							setDateTime(Date.now());
							setShow(true);
						} else if (event.event == "Rewarding"){
							setEventEmitted({
								eventEmittedName:event.event,
								eventEmittedContent:addressFormatHelper(event.returnValues.stakerAddress) + " get rewarded of " + event.returnValues.rewards + " " + addressFormatHelper(event.returnValues.stakingToken)
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
	},[contract]);

	return <>{eventEmitted &&
		<ToastContainer position="top-end" className="p-3">
			<Toast onClose={() => setShow(false)} show={show} delay={5000} autohide>
				<Toast.Header>
					<strong className="me-auto">{eventEmitted.eventEmittedName}</strong>
					<small className="text-muted">{timeSinceJS(dateTime)}</small>
				</Toast.Header>
				<Toast.Body>{eventEmitted.eventEmittedContent}</Toast.Body>
			</Toast>
		</ToastContainer>}
	</>
}
