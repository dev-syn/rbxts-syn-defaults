import React from '@rbxts/react';
import { ContextMenu } from './components/ContextMenu';
import { ContextMenuItem } from './components/ContextMenuItem';

export function SampleContextMenu() {

	return (
		<ContextMenu
			menuId='sample_context_menu'
		>
			<ContextMenuItem
				id='item_1'
				text="Sample 1"
			/>
			
			<ContextMenuItem
				id='item_2'
				text="Sample 2"
			/>

			<ContextMenuItem
				id='item_3'
				text="Sample 3"
			/>
		</ContextMenu>
	);
}