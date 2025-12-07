import { useCallback, useMemo, useState } from '@rbxts/react';
import { ContextRegistration } from '../context/ContextMenuContext';

type ContextItemData = string;

export interface ContextMenuConfig {
	/** Whether this ContextMenu can be right-clicked and activated
	 * anywhere even when no trigger element is present.
	 */
	activateAnywhere: boolean;
}

interface ContextMenuReturn {
	itemIds: Array<string | number>;
	contextVal: ContextRegistration;
}

export function useContextMenu(config: ContextMenuConfig): ContextMenuReturn {
	const [itemIds,setItemIds] = useState<Array<string | number>>([]);

	const registerItemId = useCallback((id: string | number) => {
		setItemIds(prevIds => {
			if (!prevIds.includes(id)) return [...prevIds,id];
			return prevIds;
		})
	},[]);

	const unregisterItemId = useCallback((id: string | number) =>
		setItemIds(prevIds => prevIds.filter(itemId => itemId !== id)),
	[]);

	const getLayoutOrder = useCallback((id: string | number) => {
		const idx = itemIds.findIndex(i => i === id);
		return idx === -1 ? 0 : idx + 1;
	},[itemIds]);

	const contextVal: ContextRegistration = useMemo(() => {
		return { registerItemId,unregisterItemId,getLayoutOrder };
	},[registerItemId,unregisterItemId,getLayoutOrder]);

	const { activateAnywhere } = config;

	return { itemIds, contextVal };
}

