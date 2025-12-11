import React from '@rbxts/react';
import { ContextMenu } from './components/ContextMenu';
import { ContextMenuItem } from './components/ContextMenuItem';
import { ContextMenuTriggerBtn } from './components/ContextMenuTriggerBtn';

const CONTEXT_MENU_ID = "SAMPLE_CONTEXT_MENU";
export function SampleContextMenu() {

	return (
		<>
			<ContextMenuTriggerBtn
				menuId={CONTEXT_MENU_ID}
				Text="Right-click me to open the context menu."
				LayoutOrder={4}
			/>
			<ContextMenu
				menuId={CONTEXT_MENU_ID}
			>
				<ContextMenuItem
					id='item_1'
					text="Sample 1"
					onActivate={() => {
						print(`Inside item_1`);
					}}
				/>
			
				<ContextMenuItem
					id='item_2'
					text="Sample 2"
					onActivate={() => {
						print(`Inside item_2`);
					}}
				/>

				<ContextMenuItem
					id='item_3'
					text="Sample 3"
					onActivate={() => {
						print(`Inside item_3`);
					}}
				/>
			</ContextMenu>
		</>
	);
}