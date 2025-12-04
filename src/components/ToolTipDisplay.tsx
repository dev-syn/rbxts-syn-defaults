import React, { useState } from '@rbxts/react';
import { ToolTipState } from '../hooks/useToolTip';

interface ToolTipProps {
	data: ToolTipState;
	/** Whether this ToolTip contains a background image or is text based. */
	imageContent?: string;
}

const DEFAULT_TEXT_SIZE = UDim2.fromOffset(120,30);
const DEFAULT_IMAGE_SIZE = UDim2.fromOffset(150,150);

export function ToolTipDisplay({ data,imageContent }: ToolTipProps) {

	const hasImageBackground: boolean = imageContent !== undefined && imageContent.size() > 0;
	const contentSize = hasImageBackground ? DEFAULT_IMAGE_SIZE : DEFAULT_TEXT_SIZE;

	const posOffset = UDim2.fromOffset(data.pos.X,data.pos.Y);
	let textStr = tostring(data.content);

	const children: React.ReactElement[] = [];

	if (hasImageBackground && imageContent) {
		children.push(
			<imagelabel
				key="ImageBackground"
				Image={imageContent}
				Size={UDim2.fromScale(1,1)}
				BackgroundTransparency={1}
				ZIndex={1}
				ScaleType={Enum.ScaleType.Slice}
				SliceCenter={new Rect(10,10,10,10)}
			/>
		);
	}

	children.push(
		<textlabel
			key={"TextDisplay"}
			Text={textStr}
			Size={UDim2.fromScale(1,1)}
			BackgroundTransparency={1}
			Font={Enum.Font.SourceSans}
			TextColor3={new Color3(1,1,1)}
			TextSize={16}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Center}
			TextYAlignment={Enum.TextYAlignment.Center}
			ZIndex={2}
		/>
	);
	
	return (
		<frame
			key={"ToolTipFrame"}
			Position={posOffset}
			Size={contentSize}
			BackgroundColor3={Color3.fromRGB(75,75,75)}
			BackgroundTransparency={0}
			BorderSizePixel={0}
			ZIndex={0}
		>
			{children}
		</frame>
	);
}