import React from '@rbxts/react';
import { CloseBtn } from './CloseBtn';

export const App = () => {
	return (
		<screengui ResetOnSpawn={false} DisplayOrder={10}>
			<scrollingframe Size={new UDim2(1,0,1,0)} CanvasSize={new UDim2(0,0,2,0)}>
				<uigridlayout CellSize={new UDim2(0,200,0,200)}/>
				
				<CloseBtn onClick={() => print("Close button was pressed!")} />

			</scrollingframe>
		</screengui>
	);
};