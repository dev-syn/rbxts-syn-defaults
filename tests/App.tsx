import React, { useRef } from '@rbxts/react';
import { CloseBtn } from './CloseBtn';
import { SelectableGroup } from './SelectableGroup';
import { SelectableItem } from './components/SelectableItem';

export const App = () => {
	
	return (
		<screengui ResetOnSpawn={false} DisplayOrder={10}>
			<scrollingframe
				AnchorPoint={new Vector2(0.5,0.5)}
				Size={new UDim2(0.65,0,0.55,0)}
				CanvasSize={new UDim2(0,0,1.5,0)}
				Position={new UDim2(0.5,0,0.5,0)}
			>
				<uigridlayout
				CellSize={new UDim2(0,200,0,200)}
				/>
				
				<CloseBtn
					size={UDim2.fromOffset(200,200)}
					onClose={() => {}}
				/>
				<SelectableGroup
					config={{requireSelection: true,isSingleOnly: true}}
				>
				<SelectableItem
					id="button_A"
				/>
				<SelectableItem
					id="button_B"
				/>
				<SelectableItem
					id="button_C"
				/>
				</SelectableGroup>

			</scrollingframe>
		</screengui>
	);
};