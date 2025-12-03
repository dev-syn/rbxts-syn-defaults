import React, { useContext } from '@rbxts/react';
import { PropsWithChildren } from '@rbxts/react';
import { SelectableGroupContext } from '../context/SelectableGroupContext';

interface BaseSelectableItemProps {
	id: string;
	btnType?: "TextButton" | "ImageButton"
}

interface TextModeProps extends BaseSelectableItemProps, React.InstanceProps<TextButton> {
	btnType: "TextButton"
}

interface ImageModeProps extends BaseSelectableItemProps, React.InstanceProps<ImageButton> {
	btnType: "ImageButton"
}

export type SelectableItemProps = TextModeProps | ImageModeProps;

const DEFAULT_STYLE = {
	BorderSizePixel: 1,
	BorderColor3: new Color3(0,0,0)
};
const SELECTED_STYLE = {
	BorderSizePixel: 2,
	BorderColor3: new Color3(1,1,1)
};

const DEFAULT_BG: Color3 = Color3.fromRGB(60,60,60);

export function SelectableItem(props: SelectableItemProps) {
	const { selectItem, isSelected } = useContext(SelectableGroupContext);

	const type = props.btnType ?? "TextButton";
	const isCurrentlySelected: boolean = isSelected(props.id);

	const handleClick = React.useCallback(() => {
		selectItem(props.id);
	},[props.id,selectItem]);

	const eventProps = {
		MouseButton1Click: handleClick
	};

	if (type === "ImageButton") {
		const { id,btnType,...nativeProps } = props as ImageModeProps;

		return (
			<imagebutton
				{...nativeProps}

				LayoutOrder={1}
				BackgroundColor3={DEFAULT_BG}

				{...(isCurrentlySelected ? SELECTED_STYLE : DEFAULT_STYLE)}

				Event={eventProps}
			/>
		);
	} else {
		const { id,btnType,...nativeProps } = props as TextModeProps;

		return (
			<textbutton
				{...nativeProps}

				LayoutOrder={1}
				BackgroundColor3={DEFAULT_BG}
				TextXAlignment={Enum.TextXAlignment.Center}

				{...(isCurrentlySelected ? SELECTED_STYLE : DEFAULT_STYLE)}

				Event={eventProps}
			/>
		);
	}
}