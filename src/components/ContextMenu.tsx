import React, { PropsWithChildren, useMemo, useState } from '@rbxts/react';
import { ContextMenuContext, ContextRegistration } from '../context/ContextMenuContext';
import { useContextMenu } from '../hooks/useContextMenu';

export interface ContextMenuProps extends PropsWithChildren {
	menuId: string;
}

export function ContextMenu({ menuId,children }: ContextMenuProps) {
	const { contextVal, itemIds } = useContextMenu({ menuId: menuId,config: { activateAnywhere: false } });
	
	return (
		<ContextMenuContext.Provider value={contextVal}>
			<scrollingframe
				key={`ContextMenu-${menuId}`}
				Size={UDim2.fromOffset(400,400)}
				CanvasSize={new UDim2(0,0,0,0)}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
				ScrollingDirection={Enum.ScrollingDirection.Y}
			>
			{children}
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			</scrollingframe>
		</ContextMenuContext.Provider>
	);
}