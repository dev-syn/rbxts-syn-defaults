import React, { PropsWithChildren, useMemo, useState } from '@rbxts/react';
import { ContextMenuContext, ContextRegistration } from '../context/ContextMenuContext';

export interface ContextMenuProps extends PropsWithChildren {
	menuId: string;
}

export function ContextMenu({ menuId,children }: ContextMenuProps) {
	const [itemIds,setItemIds] = useState<Array<string | number>>([]);

	const contextVal: ContextRegistration = useMemo(() => {
		const registerItemId = (id: string | number) => {
			setItemIds(prevIds => {
				if (!prevIds.includes(id)) return [...prevIds,id];
				return prevIds;
			})
		}

		const unregisterItemId = (id: string | number) =>
			setItemIds(prevIds => prevIds.filter(itemId => itemId !== id));

		return { registerItemId,unregisterItemId };
	},[]);
	
	return (
		<ContextMenuContext.Provider value={contextVal}>
			<scrollingframe
				Size={UDim2.fromOffset(400,400)}
				CanvasSize={new UDim2(0,0,0,0)}
			>
			{children}
			<uilistlayout/>
			</scrollingframe>
		</ContextMenuContext.Provider>
	);
}