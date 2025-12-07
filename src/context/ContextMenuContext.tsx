import React from '@rbxts/react';

export interface ContextRegistration {
	registerItemId: (id: string | number) => void;
	unregisterItemId: (id: string | number) => void;
	getLayoutOrder: (id: string | number) => number;
}

export const ContextMenuContext = React.createContext<ContextRegistration>({
	registerItemId: () => {},
	unregisterItemId: () => {},
	getLayoutOrder: () => 0
});
