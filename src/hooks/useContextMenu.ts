import { Ref, useCallback, useEffect, useMemo, useRef, useState } from '@rbxts/react';
import { ContextItemID, ContextMenuID, ContextRegistration } from '../context/ContextMenuContext';
import Object from '@rbxts/object-utils';

export interface ContextMenuConfig {
	/** Whether this ContextMenu can be right-clicked and activated
	 * anywhere even when no trigger element is present.
	 */
	activateAnywhere: boolean;
}

export type ContextMenuOnOpen =
	(id: ContextMenuID, mousePos: Vector2, node?: GuiObject) => void;

interface ContextMenuProps {
	menuId: ContextMenuID;
	config: ContextMenuConfig;
	onOpen?: ContextMenuOnOpen;
}

interface ContextMenuReturn {
	itemIds: Array<ContextItemID>;
	contextVal: ContextRegistration;
}

type ActionsMap = Map<ContextItemID,(...args: any[]) => void>;

export function useContextMenu({ config,menuId,onOpen }: ContextMenuProps): ContextMenuReturn {
	const [itemIds,setItemIds] = useState<Array<ContextItemID>>([]);

	const actionsRef = useRef<ActionsMap>(new Map());

	const triggerNodesRef = useRef<Map<ContextMenuID, GuiObject>>(new Map());
	const triggerConnsRef = useRef<Map<ContextMenuID, RBXScriptConnection>>(new Map());

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

	// Keep a stable ref to the latest onOpen handler (onOpen is provided via props)
	const onOpenRef = useRef<
		((id: ContextMenuID, mousePos: Vector2, node?: GuiObject) => void) | undefined
	>(onOpen);

	useEffect(() => {
		onOpenRef.current = onOpen;
	}, [onOpen]);

	const getLayoutOrder = useCallback((id: ContextItemID) => {
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

	useEffect(() => {
		return () => {
			for (const conn of Object.values(triggerConnsRef.current)) conn.Disconnect();

			triggerConnsRef.current.clear();
			triggerNodesRef.current.clear();
			actionsRef.current.clear();
		};
	},[]);

	return { itemIds, contextVal };
}

