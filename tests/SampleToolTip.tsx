import { useRef } from '@rbxts/react';
import { useToolTip, ToolTipPosition } from './hooks/useToolTip';
import { ToolTipDisplay } from './components/ToolTipDisplay';
import React from '@rbxts/react';
import { ToolTipPortal } from './portals/ToolTipPortal';
import { CalculateContentProps } from './helpers/calculateContentSize';

const DEFAULT_TOOLTIP_PROPS: Omit<CalculateContentProps,'text'> = {
	textSize: 18,
	font: Enum.Font.Gotham,
	richText: false
};

interface ToolTipSampleProps {
	calculateProps?: Omit<CalculateContentProps,'text'>
}

export function ToolTipSample({ calculateProps }: ToolTipSampleProps) {
	const testBtnRef = useRef<TextButton>();

	const _calculateProps = calculateProps ?? DEFAULT_TOOLTIP_PROPS;

	const btnToolTip = useToolTip(testBtnRef,{
		content: "A tooltip testing description.",
		delayMs: 0,
		positioningMode: ToolTipPosition.MouseBased,
		anchorPos: new Vector2(0.5,1.25)
	},_calculateProps);

	return (
		<>
			<textbutton
				ref={testBtnRef}
				Text="A test button"
				Size={UDim2.fromOffset(200,200)}
				TextColor3={new Color3(1,1,1)}
				BackgroundColor3={Color3.fromRGB(65,65,65)}
			></textbutton>

			{ btnToolTip ? (
				<ToolTipPortal>
					<ToolTipDisplay
						data={btnToolTip}
						calculateContentProps={_calculateProps}
					/>
				</ToolTipPortal>
			) : (
				<></>
			)}
		</>
	);
}