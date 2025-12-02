import { Signal } from '@rbxts/beacon';
import { useCallback, useEffect, useMemo, useRef, useState } from '@rbxts/react';

type SelectionData = string;

interface SelectableGroupConfig {
	/** Whether only a single selection can be made or multiple. */
	isSingleOnly: boolean;
	/** Whether a selection is required or no selection can be present. */
	requireSelection: boolean;
}

type SelectionChangedEvent = Signal<[prev: SelectionData[] | undefined, current: SelectionData[] | undefined]>;

interface SelectableGroupReturn {
	currentSelection: SelectionData[];
	selectItem: (id: SelectionData) => void;
	isSelected: (id: SelectionData) => boolean;
	SelectionChanged: SelectionChangedEvent
}

export function useSelectableGroup(config: SelectableGroupConfig): SelectableGroupReturn {
	const { isSingleOnly, requireSelection } = config;

	const [currentSelection, setCurrentSelection] = useState<SelectionData[]>([]);

	const prevSelectionRef = useRef<SelectionData[]>([]);

	const selChangedRef = useRef(new Signal<[SelectionData[] | undefined, SelectionData[] | undefined]>());
  const SelectionChanged = useMemo(() => selChangedRef.current,[]);

	const selectItem = useCallback((id: SelectionData) => {
		setCurrentSelection(prevSel => {
			const isAlreadySel = prevSel.includes(id);

			let prevSnap = [...prevSel];
			let newSel: SelectionData[] = [...prevSel];

			if (isSingleOnly) {
				if (isAlreadySel) {
					// If required and it's the last, do nothing
					if (requireSelection && prevSel.size() === 1) return prevSel;
					return [];
				} else { return [id]; }
			} else {
				if (isAlreadySel) {
					// If required and it's the last, do nothing
					if (requireSelection && prevSel.size() === 1) return prevSel;
					return prevSel.filter(item => item !== id);
				} else { return [...prevSel,id]; }
			}
		})
	},[isSingleOnly,requireSelection]);

	useEffect(() => {
		const prev = prevSelectionRef.current;
		const current = currentSelection;

		// Prevent firing initial mount
		if (prev === current) return;

		const hasChanged: boolean = prev.size() !== current.size() || prev.some((val,i) => val !== current[i]);
		if (hasChanged) {
			selChangedRef.current.Fire(prev,current);
			// Update ref to the new current
			prevSelectionRef.current = current;
		}
	},[currentSelection]);

	const isSelected = useCallback((id: SelectionData) => {
		return currentSelection.includes(id);
	},[currentSelection]);

	// Clean up SelectionChanged signal ref
	useEffect(() => {
		return () => selChangedRef.current.Destroy();
	},[]);

	return {
		currentSelection,
		selectItem,
		isSelected,
		SelectionChanged
	};
}