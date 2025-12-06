import React, { useContext } from '@rbxts/react';
import { ContextMenuContext } from '../context/ContextMenuContext';

export type ContextItemData = string;

interface ContextItemProps {
	id: string | number;
}

export function ContextMenuItem({ id }: ContextItemProps) {
	const { registerItemId,unregisterItemId } = useContext(ContextMenuContext);
	return (
		<textlabel

		/>
	);
}