import React, { useState } from "react";
import Form from 'react-bootstrap/Form';

export default function FormField({name, label, placeholder}) {
	const [state, setState] = useState('')
	return (
		<Form.Group className="mb-3">
			<Form.Label>{label}</Form.Label>
			<Form.Control
				type="text"
				value={state}
				name={name}
				placeholder={placeholder}
				onChange={(e) => setState(e.target.value)}
			/>
		</Form.Group>
	);
}
