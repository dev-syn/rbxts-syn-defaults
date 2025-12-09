import React from '@rbxts/react';

export type ContextItemID = string | number;
export interface ContextRegistration {
	registerItemId: (id: ContextItemID) => void;
	unregisterItemId: (id: ContextItemID) => void;

	registerAction?: (id: ContextItemID,cb: (...args: unknown[]) => void) => void;
	unregisterAction?: (id: ContextItemID) => void;
	performAction?: (id: ContextItemID,...args: unknown[]) => void;

	registerTriggerRef?: (id: ContextItemID,node: GuiObject) => void;
	unregisterTriggerRef?: (id: ContextItemID) => void;

	getLayoutOrder?: (id: ContextItemID) => number;
}

export const ContextMenuContext = React.createContext<ContextRegistration>({
	registerItemId: () => {},
	unregisterItemId: () => {},

	registerAction: () => {},
	unregisterAction: () => {},
	performAction: () => {},

	registerTriggerRef: () => {},
	unregisterTriggerRef: () => {},
	
	getLayoutOrder: () => 0,
});
