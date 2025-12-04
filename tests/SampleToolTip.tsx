import { useRef } from '@rbxts/react';
import { useToolTip, ToolTipPosition } from './hooks/useToolTip';
import { ToolTipDisplay } from './components/ToolTipDisplay';
import React from '@rbxts/react';
import { ToolTipPortal } from './portals/ToolTipPortal';

export function ToolTipSample() {
	const testBtnRef = useRef<TextButton>();

	const btnToolTip = useToolTip(testBtnRef,{
		content: "A tooltip testing description.",
		delayMs: 0,
		positioningMode: ToolTipPosition.TargetRelative,
		anchorPos: new Vector2(0.5,0.5)
	});

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
					/>
				</ToolTipPortal>
			) : (
				<></>
			)}
		</>
	);
}