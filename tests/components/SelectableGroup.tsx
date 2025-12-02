import React from '@rbxts/react';

interface SelectableGroupProps {

}

export function SelectableGroup(props: SelectableGroupProps) {
	return (
		<scrollingframe
		BackgroundColor3={Color3.fromRGB(105,105,105)}
		>
			<uilistlayout/>
			<textbutton
			Text={"A button."}
			/>
		</scrollingframe>
	);
}