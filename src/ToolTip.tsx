import React, { useState } from '@rbxts/react';

interface ToolTipProps {
	position: UDim;
	/** Whether this ToolTip contains a background image or is text based. */
	imageContent?: string;
	/** The ID  */
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