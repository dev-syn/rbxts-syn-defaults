import React, { PropsWithChildren, useMemo } from '@rbxts/react';
import { SelectableGroupConfig, useSelectableGroup } from '../../src/hooks/useSelectableGroup';
import { SelectableItem } from './SelectableItem';
import { SelectableGroupContext } from '../context/SelectableGroupContext';

interface SelectableGroupProps extends PropsWithChildren {
	config: SelectableGroupConfig;
	onSelectionChanged?: (prev: string[] | undefined,current: string[] | undefined) => void;
}

export function SelectableGroup({ config, onSelectionChanged, children }: SelectableGroupProps) {

	const { isSingleOnly, requireSelection } = config;

	const {
		selectItem,
		isSelected,
		SelectionChanged
	} = useSelectableGroup({ isSingleOnly, requireSelection });

	const contextValue = useMemo(() => ({
		selectItem,
		isSelected
	}),[selectItem,isSelected]);

	return (
		<SelectableGroupContext.Provider
			value={contextValue}
		>
			<scrollingframe
				Size={UDim2.fromScale(1,1)}
				BackgroundColor3={Color3.fromRGB(105,105,105)}
				CanvasSize={UDim2.fromScale(0,0)}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Vertical}
          SortOrder={Enum.SortOrder.LayoutOrder}
          Padding={new UDim(0, 5)}
				/>
				{children}
			</scrollingframe>
		</SelectableGroupContext.Provider>
	);
}