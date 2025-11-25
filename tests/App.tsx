import React from '@rbxts/react';
import { CloseBtn } from './CloseBtn';

export const App = () => {
	return (
		<screengui ResetOnSpawn={false} DisplayOrder={10}>
			<scrollingframe
				AnchorPoint={new Vector2(0.5,0.5)}
				Size={new UDim2(0.65,0,0.55,0)}
				CanvasSize={new UDim2(0,0,1.5,0)}
				Position={new UDim2(0.5,0,0.5,0)}
			>
				<uigridlayout CellSize={new UDim2(0,200,0,200)}/>
				
				<CloseBtn onClick={() => print("Close button was pressed!")} />

			</scrollingframe>
		</screengui>
	);
};