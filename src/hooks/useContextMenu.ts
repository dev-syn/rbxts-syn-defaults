import { Ref, useCallback, useMemo, useRef, useState } from '@rbxts/react';
import { ContextItemID, ContextRegistration } from '../context/ContextMenuContext';

export interface ContextMenuConfig {
	/** Whether this ContextMenu can be right-clicked and activated
	 * anywhere even when no trigger element is present.
	 */
	activateAnywhere: boolean;
}

interface ContextMenuProps {
	menuId: string;
	config: ContextMenuConfig;
	triggerElement: Ref<TextButton>
}

interface ContextMenuReturn {
	itemIds: Array<string | number>;
	contextVal: ContextRegistration;
}

type ActionsMap = Map<string | number,(...args: any[]) => void>;

export function useContextMenu({ config,menuId }: ContextMenuProps): ContextMenuReturn {
	const [itemIds,setItemIds] = useState<Array<ContextItemID>>([]);
	const [actions,setActions] = useState<ActionsMap>(new Map());

	const actionsRef = useRef<ActionsMap>(new Map());

	const { activateAnywhere } = config;

	const registerItemId = useCallback((id: ContextItemID) => {
		setItemIds(prevIds => {
			if (!prevIds.includes(id)) return [...prevIds,id];
			return prevIds;
		})
	},[]);
	const unregisterItemId = useCallback((id: ContextItemID) => {
		setItemIds(prevIds => prevIds.filter(itemId => itemId !== id));
		actionsRef.current.delete(id);
	},[]);

	const registerAction = useCallback((id: ContextItemID,cb: (...args: unknown[]) => void) => {
		actionsRef.current.set(id,cb);
	},[]);
	const unregisterAction = useCallback((id: ContextItemID) => {
		actionsRef.current.delete(id);
	},[]);
	const performAction = useCallback((id: ContextItemID,...args: unknown[]) => {
		const fn = actionsRef.current.get(id);
		if (fn) fn(...args);
	},[]);

	const getLayoutOrder = useCallback((id: string | number) => {
		const idx = itemIds.findIndex(i => i === id);
		return idx === -1 ? 0 : idx + 1;
	},[itemIds]);

	const contextVal: ContextRegistration = useMemo(() => {
		return {
			registerItemId,
			unregisterItemId,
			
			registerAction,
			unregisterAction,
			performAction,

			getLayoutOrder
		};
	},[
		registerItemId,
		unregisterItemId,

		registerAction,
		unregisterAction,
		performAction,

		getLayoutOrder
	]);

	return { itemIds, contextVal };
}

