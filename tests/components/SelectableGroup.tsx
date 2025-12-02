import React from '@rbxts/react';
import { useSelectableGroup } from '../../src/hooks/useSelectableGroup';

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
			<textbutton
			LayoutOrder={1}
			BackgroundColor3={Color3.fromRGB(60,60,60)}
			TextXAlignment={Enum.TextXAlignment.Center}
			Text={"A button."}
			Event={{
				MouseButton1Click: () => selectItem()
			}}
			/>
			<textbutton
			LayoutOrder={2}
			BackgroundColor3={Color3.fromRGB(60,60,60)}
			TextXAlignment={Enum.TextXAlignment.Center}
			Text={"B button."}
			/>
			<textbutton
			LayoutOrder={3}
			BackgroundColor3={Color3.fromRGB(60,60,60)}
			TextXAlignment={Enum.TextXAlignment.Center}
			Text={"C button."}
			/>
		</scrollingframe>
	);
}