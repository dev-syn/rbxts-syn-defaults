import React from '@rbxts/react';
import { useSelectableGroup } from '../../src/hooks/useSelectableGroup';
import { SelectableItem } from './SelectableItem';

interface SelectableGroupProps {

}

export function SelectableGroup(props: SelectableGroupProps) {

	const {
		currentSelection, selectItem,
		isSelected, SelectionChanged
	} = useSelectableGroup({ isSingleOnly: true, requireSelection: false });

	return (
		<scrollingframe
		BackgroundColor3={Color3.fromRGB(105,105,105)}
		>
			<uilistlayout/>
			<SelectableItem/>
		</scrollingframe>
	);
}