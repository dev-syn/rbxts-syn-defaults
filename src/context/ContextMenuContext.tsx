import React from '@rbxts/react';

export interface ContextRegistration {
	registerItemId: (id: string | number) => void;
	unregisterItemId: (id: string | number) => void;
}

export const ContextMenuContext = React.createContext<ContextRegistration>({
	registerItemId: () => {},
	unregisterItemId: () => {}
});
