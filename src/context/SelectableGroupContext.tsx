import { createContext } from '@rbxts/react';

interface SelectableGroupContextValue {
	selectItem: (id: string) => void;
	isSelected: (id: string) => boolean;
	idAttach: (id: string) => void;
}

export const SelectableGroupContext = createContext<SelectableGroupContextValue>({
	selectItem: () => {},
	isSelected: () => false,
	idAttach: () => {}
});