import React, { useContext } from '@rbxts/react';
import { PropsWithChildren } from '@rbxts/react';
import { SelectableGroupContext } from '../context/SelectableGroupContext';

interface SelectableItemProps extends PropsWithChildren {
	id: string;
}

const DEFAULT_STYLE = {
	BorderSizePixel: 1,
	BorderColor3: new Color3(0,0,0)
};
const SELECTED_STYLE = {
	BorderSizePixel: 2,
	BorderColor3: new Color3(1,1,1)
};

export function SelectableItem(props: SelectableItemProps) {
	const { selectItem, isSelected } = useContext(SelectableGroupContext);

	const isCurrentlySelected: boolean = isSelected(props.id);
	
	const handleClick = React.useCallback(() => {
		selectItem(props.id);
	},[props.id,selectItem]);

	return (
		<textbutton
			LayoutOrder={1}
			BackgroundColor3={Color3.fromRGB(60,60,60)}
			TextXAlignment={Enum.TextXAlignment.Center}

			{...(isCurrentlySelected ? SELECTED_STYLE : DEFAULT_STYLE)}

			Event={{
				MouseButton1Click: () => handleClick
			}}
		/>
	);
}