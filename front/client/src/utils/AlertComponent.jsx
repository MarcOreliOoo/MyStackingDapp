import React, { useState } from "react";
import Alert from 'react-bootstrap/Alert';

export default function AlertComponent({ children }) {
	const [show, setShow] = useState(true);

	if (show) {
		if(typeof(children) === 'object'){
			const child = Object.entries(children);
			/* Object.entries(children).forEach(
				([key,val]) => console.log(`${key}: ${val}`)
			); */
			
			return (
				<Alert variant="danger" onClose={() => setShow(false)} dismissible>
					{child[0] && <Alert.Heading>{child[0]}</Alert.Heading>}
						{child[1] && <p>{child[1]}</p>}
				</Alert>	
			);
		}
		return (
			<Alert variant="danger" onClose={() => setShow(false)} dismissible>
		  		<Alert.Heading>Oh snap! You got an error!</Alert.Heading>
		  		<p>{children}</p>
			</Alert>
	  	);
	}
	return <></>;
}