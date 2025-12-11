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
	const { selectItem, isSelected, idAttach } = useContext(SelectableGroupContext);

	idAttach(props.id);

	const btnType = props.btnType ?? "TextButton";
	const isCurrentlySelected: boolean = isSelected(props.id);

	const handleClick = React.useCallback(() => {
		selectItem(props.id);
	},[props.id,selectItem]);

	const eventProps = {
		Activated: handleClick
	};

	const nativeProps = {...props} as Record<string,unknown>;

	delete nativeProps.id;
	delete nativeProps.btnType;
	delete nativeProps.children;

	if (btnType === "ImageButton") {
		return (
			<imagebutton
				{...nativeProps}

				LayoutOrder={1}
				BackgroundColor3={DEFAULT_BG}
				BorderMode={Enum.BorderMode.Inset}

				{...(isCurrentlySelected ? SELECTED_STYLE : DEFAULT_STYLE)}

				Event={eventProps}
			/>
		);
	} else {
		return (
			<textbutton
				{...nativeProps}

				LayoutOrder={1}
				BackgroundColor3={DEFAULT_BG}
				TextXAlignment={Enum.TextXAlignment.Center}
				BorderMode={Enum.BorderMode.Inset}

				{...(isCurrentlySelected ? SELECTED_STYLE : DEFAULT_STYLE)}

				Event={eventProps}
			/>
		);
	}
}