import React from '@rbxts/react';
import { PropsWithChildren } from '@rbxts/react';

interface SelectableItemProps extends PropsWithChildren {
	id: string;
}

export function SelectableItem(props: SelectableItemProps) {
	return (
		<textbutton
			LayoutOrder={1}
			BackgroundColor3={Color3.fromRGB(60,60,60)}
			TextXAlignment={Enum.TextXAlignment.Center}
			Event={{
				MouseButton1Click: () => selectItem(props.id)
			}}
		/>
	);
}