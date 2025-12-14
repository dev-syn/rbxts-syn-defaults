import React, { useState } from '@rbxts/react';
import { ToolTipState } from '../hooks/useToolTip';
import { CalculateContentProps, isFontObject } from '../helpers/calculateContentSize';

interface ToolTipProps {
	data: ToolTipState;
	/** Whether this ToolTip contains a background image or is text based. */
	imageContent?: string;
	calculateContentProps: Omit<CalculateContentProps,'text'>;
}

const DEFAULT_TEXT_SIZE = UDim2.fromOffset(120,30);
const DEFAULT_IMAGE_SIZE = UDim2.fromOffset(150,150);

export function ToolTipDisplay({ data,imageContent,calculateContentProps }: ToolTipProps) {

	const hasImageBackground: boolean = imageContent !== undefined && imageContent.size() > 0;
	const contentSize = hasImageBackground ? DEFAULT_IMAGE_SIZE : DEFAULT_TEXT_SIZE;

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


	const fontProps: { Font?: Enum.Font,FontFace?: Font } = {};
	if (isFontObject(calculateContentProps.font)) fontProps.FontFace = calculateContentProps.font;
	else fontProps.Font =  calculateContentProps.font;
	
	children.push(
		<textlabel
			key={"TextDisplay"}
			Text={textStr}
			Size={UDim2.fromScale(1,1)}
			BackgroundTransparency={1}
			TextColor3={new Color3(1,1,1)}
			TextSize={calculateContentProps.textSize}
			RichText={calculateContentProps.richText}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Center}
			TextYAlignment={Enum.TextYAlignment.Center}
			ZIndex={2}

			{...fontProps}
		/>
	);

	return (
		<frame
			key={"ToolTipFrame"}
			Size={UDim2.fromOffset(data.calculatedSize.X,data.calculatedSize.Y)}
			BackgroundColor3={Color3.fromRGB(75,75,75)}
			BackgroundTransparency={0}
			BorderSizePixel={0}
			ZIndex={0}
			Position={data.bind_pos}
		>
			{children}
		</frame>
	);
}