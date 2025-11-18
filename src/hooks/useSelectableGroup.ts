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

	const selChangedRef = useRef(new Signal<[SelectionData[] | undefined, SelectionData[] | undefined]>());
  const SelectionChanged = useMemo(() => selChangedRef.current,[]);

	const isSelected = useCallback((id: SelectionData) => {
		return currentSelection.includes(id);
	},[currentSelection]);

	const selectItem = useCallback((id: SelectionData) => {
		setCurrentSelection(prevSel => {
			const isAlreadySel = prevSel.includes(id);

			let prevSnap = [...prevSel];
			let newSel: SelectionData[] = [...prevSel];

			if (isSingleOnly) {
				if (isAlreadySel) {
					// Deselecting: Check if required. I broke DRY, sue me
					if (requireSelection && prevSel.size() === 1) return prevSel;
					newSel = [];
				} else newSel = [id];
			} else { // Multi-selection is enabled guys?
				if (isAlreadySel) {
					// Deselecting: Check if required. I broke DRY, sue me
					if (requireSelection && prevSel.size() === 1) return prevSel;
					newSel = prevSel.filter(item => item !== id);
				} else newSel = [...prevSel,id];
			}

			// If any changes are noticed from the old to the new selections then we will notify the signal responders.
			if (
				prevSel.size() !== newSel.size() ||
				prevSel.some((val,i) => val !== newSel[i])) {
					SelectionChanged.Fire(prevSnap,newSel);
					return newSel;
			} 

			return prevSel;
		})
	},[isSingleOnly,requireSelection,SelectionChanged]);

	// Clean up SelectionChanged signal ref
	useEffect(() => {
		return () => {
			selChangedRef.current.Destroy();
		}
	},[]);

	return {
		currentSelection,
		selectItem,
		isSelected,
		SelectionChanged
	};
}