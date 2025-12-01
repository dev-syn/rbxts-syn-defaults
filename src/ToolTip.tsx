import React, { useState } from '@rbxts/react';

interface ToolTipProps {
	position: UDim;
	id?: string;
}

export function ToolTip(props: ToolTipProps) {
	const id: string = props.id !== undefined ? `-${props.id}` : "";
	const [text,setText] = useState("");

	return (
		<textlabel
			key={"ToolTip" + id}
			Text={text}
		/>
	);
}